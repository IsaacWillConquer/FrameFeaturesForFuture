import 'dart:async';

import 'package:flutter/material.dart';

// Signs the user out after a period with no interaction. Mirrors the web IdleGuard.
class IdleWatcher extends StatefulWidget {
  final Widget child;
  final Duration timeout;
  final VoidCallback onIdle;

  const IdleWatcher({
    super.key,
    required this.child,
    required this.timeout,
    required this.onIdle,
  });

  @override
  State<IdleWatcher> createState() => _IdleWatcherState();
}

class _IdleWatcherState extends State<IdleWatcher> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _reset();
  }

  void _reset() {
    _timer?.cancel();
    _timer = Timer(widget.timeout, () {
      if (mounted) widget.onIdle();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Listener(
      behavior: HitTestBehavior.translucent,
      onPointerDown: (_) => _reset(),
      onPointerMove: (_) => _reset(),
      onPointerSignal: (_) => _reset(),
      child: widget.child,
    );
  }
}
