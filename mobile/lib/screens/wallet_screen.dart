import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../config/app_config.dart';
import '../core/auth_service.dart';
import '../core/payment_qr.dart';
import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';
import 'scan_screen.dart';

// Simulated wallet: balance, top-up, transfer, ledger, QR pay/receive.
// Same data model as the web wallet.
class WalletScreen extends StatefulWidget {
  final String uid;
  final String name;
  final String? initialToUid;
  final String? initialAmount;
  final String? initialNote;

  const WalletScreen({
    super.key,
    required this.uid,
    required this.name,
    this.initialToUid,
    this.initialAmount,
    this.initialNote,
  });

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  static const _startingBalance = 500;
  final _amount = TextEditingController();
  final _topUpAmount = TextEditingController();
  final _db = FirebaseFirestore.instance;
  String? _toUid;
  String _message = '';
  String _error = '';
  bool _busy = false;
  bool _showQr = false;

  Future<void> _ensureWallet() async {
    final ref = _db.collection(AppConfig.wallets).doc(widget.uid);
    final snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        'uid': widget.uid,
        'balance': _startingBalance,
        'createdAt': FieldValue.serverTimestamp(),
      });
    }
  }

  Future<void> _topUp() async {
    final value = double.tryParse(_topUpAmount.text) ?? 0;
    if (value <= 0) {
      setState(() => _error = 'Enter an amount greater than zero.');
      return;
    }
    setState(() {
      _busy = true;
      _error = '';
      _message = '';
    });
    try {
      await _db.collection(AppConfig.wallets).doc(widget.uid).set({
        'balance': FieldValue.increment(value),
        'uid': widget.uid,
      }, SetOptions(merge: true));
      await _db.collection(AppConfig.transactions).add({
        'uid': widget.uid,
        'type': 'topup',
        'amount': value,
        'note': 'Simulated top-up',
        'status': 'simulated',
        'createdAt': FieldValue.serverTimestamp(),
      });
      await AuthService.logAction(widget.uid, 'wallet_topup', '$value');
      if (mounted) {
        setState(() {
          _message = 'Added $value (simulated).';
          _topUpAmount.clear();
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _busy = false);
  }

  Future<void> _send() async {
    final value = double.tryParse(_amount.text) ?? 0;
    final toUid = _toUid;
    if (toUid == null || value <= 0) {
      setState(() => _error = 'Choose a recipient and enter an amount.');
      return;
    }
    setState(() {
      _busy = true;
      _error = '';
      _message = '';
    });
    try {
      final wallet =
          await _db.collection(AppConfig.wallets).doc(widget.uid).get();
      final balance = (wallet.data()?['balance'] as num?)?.toDouble() ?? 0;
      if (balance < value) {
        if (mounted) setState(() => _error = 'Not enough balance.');
        return;
      }
      final batch = _db.batch();
      batch.set(
        _db.collection(AppConfig.wallets).doc(widget.uid),
        {'balance': FieldValue.increment(-value)},
        SetOptions(merge: true),
      );
      batch.set(
        _db.collection(AppConfig.wallets).doc(toUid),
        {'balance': FieldValue.increment(value), 'uid': toUid},
        SetOptions(merge: true),
      );
      await batch.commit();
      await _db.collection(AppConfig.transactions).add({
        'uid': widget.uid,
        'type': 'payment_sent',
        'toUid': toUid,
        'amount': value,
        'note': '',
        'status': 'simulated',
        'createdAt': FieldValue.serverTimestamp(),
      });
      await _db.collection(AppConfig.transactions).add({
        'uid': toUid,
        'type': 'payment_received',
        'fromUid': widget.uid,
        'amount': value,
        'note': '',
        'status': 'simulated',
        'createdAt': FieldValue.serverTimestamp(),
      });
      await AuthService.logAction(widget.uid, 'payment_sent', '$value to $toUid');
      if (mounted) {
        setState(() {
          _message = 'Sent $value (simulated).';
          _amount.clear();
          _showQr = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _busy = false);
  }

  // Opens the scanner; a payment/profile code prefills the send form.
  Future<void> _scanToPay() async {
    final raw = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (_) => const ScanScreen(payMode: true)),
    );
    if (raw == null || !mounted) return;
    final qr = parsePaymentQR(raw);
    if (qr == null) {
      setState(() => _error = 'That QR is not an AWA payment or profile code.');
      return;
    }
    setState(() {
      _error = '';
      if (qr.type == 'pay') {
        _toUid = qr.toUid;
        _amount.text = qr.amount.toStringAsFixed(qr.amount.truncateToDouble() == qr.amount ? 0 : 2);
        _message = 'Scanned a request for ${qr.amount}. Check the details, then press Send.';
      } else {
        _toUid = qr.uid;
        _message = 'Scanned the recipient${qr.name.isNotEmpty ? ' ${qr.name}' : ''}. Enter an amount and press Send.';
      }
    });
  }

  @override
  void initState() {
    super.initState();
    _toUid = widget.initialToUid;
    if (widget.initialAmount != null) _amount.text = widget.initialAmount!;
    _ensureWallet().catchError((_) {});
  }

  @override
  void dispose() {
    _amount.dispose();
    _topUpAmount.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final walletStream = _db
        .collection(AppConfig.wallets)
        .doc(widget.uid)
        .snapshots();
    final peopleStream = _db
        .collection(AppConfig.publicProfiles)
        .snapshots();
    final value = double.tryParse(_amount.text) ?? 0;
    final canShowQr = _toUid != null && value > 0;

    return Scaffold(
      appBar: AppBar(title: const Text('Wallet')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: [
            StreamBuilder<DocumentSnapshot<Map<String, dynamic>>>(
              stream: walletStream,
              builder: (context, snap) {
                final balance = (snap.data?.data()?['balance'] as num?) ?? 0;
                return _BalanceHero(balance: balance);
              },
            ),
            if (_error.isNotEmpty) ...[
              const SizedBox(height: AwaTheme.gapM),
              InlineMessage(text: _error, isError: true),
            ],
            if (_message.isNotEmpty) ...[
              const SizedBox(height: AwaTheme.gapM),
              InlineMessage(text: _message),
            ],
            const SizedBox(height: AwaTheme.gapXl),
            const AwaSectionTitle(kicker: 'Transfer', title: 'Send payment'),
            const SizedBox(height: AwaTheme.gapM),
            AwaCard(
              child: Column(
                children: [
                  StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
                    stream: peopleStream,
                    builder: (context, snap) {
                      final docs = (snap.data?.docs ?? [])
                          .where((d) => d.id != widget.uid)
                          .toList();
                      // If a recipient was prefilled (e.g. from a scanned code)
                      // before the profile list loaded, include a placeholder so
                      // the dropdown's value always matches an item.
                      final hasSelected = _toUid != null && docs.any((d) => d.id == _toUid);
                      final items = <DropdownMenuItem<String>>[
                        ...docs.map((d) => DropdownMenuItem(
                              value: d.id,
                              child: Text(
                                (d.data()['name'] as String?)?.isNotEmpty == true
                                    ? d.data()['name'] as String
                                    : (d.data()['email'] as String? ?? d.id),
                                overflow: TextOverflow.ellipsis,
                              ),
                            )),
                        if (_toUid != null && !hasSelected)
                          DropdownMenuItem(value: _toUid, child: Text(_toUid!)),
                      ];
                      return DropdownButtonFormField<String>(
                        initialValue: _toUid,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          labelText: 'Recipient',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                        hint: const Text('Choose someone'),
                        items: items,
                        onChanged: (v) => setState(() => _toUid = v),
                      );
                    },
                  ),
                  const SizedBox(height: AwaTheme.gapM),
                  TextField(
                    controller: _amount,
                    keyboardType: TextInputType.number,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      labelText: 'Amount',
                      prefixIcon: Icon(Icons.attach_money),
                    ),
                  ),
                  const SizedBox(height: AwaTheme.gapM),
                  Row(
                    children: [
                      Expanded(
                        child: FilledButton(
                          onPressed: _busy ? null : _send,
                          child: const Text('Send'),
                        ),
                      ),
                      const SizedBox(width: AwaTheme.gapS),
                      OutlinedButton.icon(
                        onPressed: _busy ? null : _scanToPay,
                        icon: const Icon(Icons.qr_code_scanner),
                        label: const Text('Scan'),
                      ),
                    ],
                  ),
                  if (canShowQr) ...[
                    const SizedBox(height: AwaTheme.gapS),
                    TextButton.icon(
                      onPressed: () => setState(() => _showQr = !_showQr),
                      icon: const Icon(Icons.qr_code),
                      label: Text(_showQr ? 'Hide payment QR' : 'Show payment QR'),
                    ),
                    if (_showQr)
                      Padding(
                        padding: const EdgeInsets.only(top: AwaTheme.gapS),
                        child: _QrBlock(
                          data: encodePaymentQR(toUid: _toUid!, amount: value),
                        ),
                      ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: AwaTheme.gapXl),
            const AwaSectionTitle(kicker: 'Demo', title: 'Add demo credits'),
            const SizedBox(height: AwaTheme.gapM),
            AwaCard(
              child: Column(
                children: [
                  TextField(
                    controller: _topUpAmount,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Amount',
                      prefixIcon: Icon(Icons.add_card),
                    ),
                  ),
                  const SizedBox(height: AwaTheme.gapM),
                  OutlinedButton.icon(
                    onPressed: _busy ? null : _topUp,
                    icon: const Icon(Icons.add),
                    label: const Text('Top up'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AwaTheme.gapXl),
            const AwaSectionTitle(kicker: 'Get paid', title: 'My receive code'),
            const SizedBox(height: AwaTheme.gapM),
            AwaCard(
              child: Column(
                children: [
                  Text(
                    'Show this to someone so they can pay you (simulated).',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                  const SizedBox(height: AwaTheme.gapM),
                  _QrBlock(data: encodeProfileQR(uid: widget.uid, name: widget.name)),
                ],
              ),
            ),
            const SizedBox(height: AwaTheme.gapXl),
            const AwaSectionTitle(kicker: 'History', title: 'Recent transactions'),
            const SizedBox(height: AwaTheme.gapM),
            _Transactions(uid: widget.uid),
          ],
        ),
      ),
    );
  }
}

class _BalanceHero extends StatelessWidget {
  final num balance;
  const _BalanceHero({required this.balance});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AwaTheme.gapL),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [scheme.primary, scheme.primary.withValues(alpha: 0.80)],
        ),
        borderRadius: BorderRadius.circular(AwaTheme.radius),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.account_balance_wallet, size: 18, color: scheme.onPrimary.withValues(alpha: 0.9)),
              const SizedBox(width: AwaTheme.gapS),
              Text(
                'Balance (demo credits)',
                style: text.labelLarge?.copyWith(color: scheme.onPrimary.withValues(alpha: 0.9)),
              ),
            ],
          ),
          const SizedBox(height: AwaTheme.gapM),
          Text(
            '$balance',
            style: text.displaySmall?.copyWith(
              color: scheme.onPrimary,
              fontWeight: FontWeight.w800,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }
}

class _QrBlock extends StatelessWidget {
  final String data;
  const _QrBlock({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AwaTheme.gapM),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AwaTheme.radiusSm),
      ),
      child: QrImageView(
        data: data,
        size: 200,
        backgroundColor: Colors.white,
      ),
    );
  }
}

class _Transactions extends StatelessWidget {
  final String uid;
  const _Transactions({required this.uid});

  @override
  Widget build(BuildContext context) {
    final stream = FirebaseFirestore.instance
        .collection(AppConfig.transactions)
        .where('uid', isEqualTo: uid)
        .snapshots();
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: stream,
      builder: (context, snap) {
        if (snap.hasError) {
          return const InlineMessage(text: 'Could not load transactions.', isError: true);
        }
        if (!snap.hasData) {
          return const Padding(
            padding: EdgeInsets.all(AwaTheme.gapL),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        final docs = snap.data!.docs.toList()
          ..sort((a, b) {
            final ta = (a.data()['createdAt'] as Timestamp?)?.millisecondsSinceEpoch ?? 0;
            final tb = (b.data()['createdAt'] as Timestamp?)?.millisecondsSinceEpoch ?? 0;
            return tb.compareTo(ta);
          });
        if (docs.isEmpty) {
          return const AwaCard(
            child: EmptyState(
              icon: Icons.receipt_long_outlined,
              title: 'No transactions yet',
              message: 'Top up or send a payment to get started.',
            ),
          );
        }
        return Column(
          children: docs.take(20).map((d) => _TransactionRow(data: d.data())).toList(),
        );
      },
    );
  }
}

class _TransactionRow extends StatelessWidget {
  final Map<String, dynamic> data;
  const _TransactionRow({required this.data});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    final outgoing = data['type'] == 'payment_sent';
    final incoming = data['type'] == 'payment_received';
    final accent = incoming ? const Color(0xFF12805C) : scheme.onSurfaceVariant;
    final title = '${data['type'] ?? ''}'.replaceAll('_', ' ');
    final note = '${data['note'] ?? ''}';
    return Padding(
      padding: const EdgeInsets.only(bottom: AwaTheme.gapS),
      child: AwaCard(
        padding: const EdgeInsets.symmetric(horizontal: AwaTheme.gapM, vertical: AwaTheme.gapS + AwaTheme.gapXs),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: accent.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(
                outgoing
                    ? Icons.arrow_upward
                    : incoming
                        ? Icons.arrow_downward
                        : Icons.add,
                size: 20,
                color: accent,
              ),
            ),
            const SizedBox(width: AwaTheme.gapM),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: text.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                  if (note.isNotEmpty)
                    Text(
                      note,
                      style: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
                    ),
                ],
              ),
            ),
            Text(
              '${outgoing ? '-' : '+'}${data['amount'] ?? ''}',
              style: text.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: outgoing ? scheme.onSurface : const Color(0xFF12805C),
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
