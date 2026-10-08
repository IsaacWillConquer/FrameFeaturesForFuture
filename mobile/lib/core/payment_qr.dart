import 'dart:convert';

// Payment/profile data carried inside a QR code. Port of
// web/src/core/qr/paymentQR.js so phone and web codes are interchangeable.
// Versioned with a prefix so a scanned code can be validated first.
const _prefix = 'AWA1:';

String encodePaymentQR({
  required String toUid,
  required num amount,
  String note = '',
}) =>
    _prefix +
    jsonEncode({'t': 'pay', 'toUid': toUid, 'amount': amount, 'note': note});

String encodeProfileQR({required String uid, String name = ''}) =>
    _prefix + jsonEncode({'t': 'me', 'uid': uid, 'name': name});

class PaymentQR {
  final String type; // 'pay' | 'me'
  final String? toUid;
  final String? uid;
  final double amount;
  final String note;
  final String name;

  const PaymentQR({
    required this.type,
    this.toUid,
    this.uid,
    this.amount = 0,
    this.note = '',
    this.name = '',
  });
}

// Returns a PaymentQR for a valid AWA code, otherwise null.
PaymentQR? parsePaymentQR(String text) {
  if (!text.startsWith(_prefix)) return null;
  try {
    final data = jsonDecode(text.substring(_prefix.length)) as Map<String, dynamic>;
    final type = data['t'];
    if (type == 'pay') {
      final toUid = data['toUid'];
      final amount = (data['amount'] as num?)?.toDouble() ?? 0;
      if (toUid is String && toUid.isNotEmpty && amount > 0) {
        return PaymentQR(
          type: 'pay',
          toUid: toUid,
          amount: amount,
          note: (data['note'] as String?) ?? '',
        );
      }
    }
    if (type == 'me') {
      final uid = data['uid'];
      if (uid is String && uid.isNotEmpty) {
        return PaymentQR(type: 'me', uid: uid, name: (data['name'] as String?) ?? '');
      }
    }
  } catch (_) {
    return null;
  }
  return null;
}
