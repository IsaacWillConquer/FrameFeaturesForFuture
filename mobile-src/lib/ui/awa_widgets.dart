import 'package:flutter/material.dart';

import 'awa_theme.dart';

// Shared, reusable pieces of the AWA look. Keeping them here means every screen
// speaks the same visual language (and accessibility behaviour) for free.

/// A rounded surface with a soft hairline border, used everywhere instead of
/// the default [Card]. Optional [onTap] adds an ink ripple.
class AwaCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final bool tinted;
  final Color? color;

  const AwaCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AwaTheme.gapM),
    this.onTap,
    this.tinted = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final bg = color ??
        (tinted ? scheme.primary.withValues(alpha: 0.06) : scheme.surface);
    final content = Padding(padding: padding, child: child);
    return Material(
      color: bg,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AwaTheme.radius),
        side: BorderSide(color: scheme.outlineVariant.withValues(alpha: 0.55)),
      ),
      clipBehavior: Clip.antiAlias,
      child: onTap == null ? content : InkWell(onTap: onTap, child: content),
    );
  }
}

/// A small accent "kicker" label above a section title.
class AwaSectionTitle extends StatelessWidget {
  final String title;
  final String? kicker;
  final Widget? trailing;

  const AwaSectionTitle({super.key, required this.title, this.kicker, this.trailing});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (kicker != null) ...[
                Text(
                  kicker!.toUpperCase(),
                  style: text.labelSmall?.copyWith(
                    color: scheme.primary,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.1,
                  ),
                ),
                const SizedBox(height: AwaTheme.gapXs),
              ],
              Text(
                title,
                style: text.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}

/// Shown when a list has nothing in it yet — always with guidance, never a
/// bare sentence.
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? message;
  final Widget? action;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AwaTheme.gapL, horizontal: AwaTheme.gapM),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: scheme.primary.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 30, color: scheme.primary),
          ),
          const SizedBox(height: AwaTheme.gapM),
          Text(
            title,
            textAlign: TextAlign.center,
            style: text.titleSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          if (message != null) ...[
            const SizedBox(height: AwaTheme.gapXs),
            Text(
              message!,
              textAlign: TextAlign.center,
              style: text.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
            ),
          ],
          if (action != null) ...[
            const SizedBox(height: AwaTheme.gapM),
            action!,
          ],
        ],
      ),
    );
  }
}

/// A single inline status line. Error or success, with a matching icon. Kept as
/// a live region so TalkBack announces it the moment it appears.
class InlineMessage extends StatelessWidget {
  final String text;
  final bool isError;

  const InlineMessage({super.key, required this.text, this.isError = false});

  @override
  Widget build(BuildContext context) {
    if (text.isEmpty) return const SizedBox.shrink();
    final scheme = Theme.of(context).colorScheme;
    final accent = isError ? scheme.error : const Color(0xFF12805C);
    return Semantics(
      liveRegion: true,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
          horizontal: AwaTheme.gapM,
          vertical: AwaTheme.gapS + AwaTheme.gapXs,
        ),
        decoration: BoxDecoration(
          color: accent.withValues(alpha: 0.10),
          borderRadius: BorderRadius.circular(AwaTheme.radiusSm),
          border: Border.all(color: accent.withValues(alpha: 0.35)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              isError ? Icons.error_outline : Icons.check_circle_outline,
              size: 20,
              color: accent,
            ),
            const SizedBox(width: AwaTheme.gapS),
            Expanded(
              child: Text(
                text,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: accent),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A circular initials avatar (photos > initials > generic icon).
class AvatarChip extends StatelessWidget {
  final String name;
  final double size;

  const AvatarChip({super.key, required this.name, this.size = 48});

  String get _initials {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.characters.first.toUpperCase();
    return (parts.first.characters.first + parts.last.characters.first).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: scheme.primary.withValues(alpha: 0.12),
        shape: BoxShape.circle,
      ),
      child: Text(
        _initials,
        style: TextStyle(
          color: scheme.primary,
          fontWeight: FontWeight.w700,
          fontSize: size * 0.36,
        ),
      ),
    );
  }
}

/// The little brand mark used on the auth screens.
class AwaLogoMark extends StatelessWidget {
  final double size;
  const AwaLogoMark({super.key, this.size = 64});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [scheme.primary, scheme.primary.withValues(alpha: 0.78)],
        ),
        borderRadius: BorderRadius.circular(size * 0.28),
      ),
      child: Text(
        'AWA',
        style: TextStyle(
          color: scheme.onPrimary,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.5,
          fontSize: size * 0.26,
        ),
      ),
    );
  }
}

/// Intro block for full-screen pages: optional logo/icon, a bold title and a
/// muted subtitle. Used across the auth / gated screens so they match.
class AwaIntro extends StatelessWidget {
  final String title;
  final String? subtitle;
  final bool showLogo;
  final IconData? icon;

  const AwaIntro({
    super.key,
    required this.title,
    this.subtitle,
    this.showLogo = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        if (showLogo) ...[
          const AwaLogoMark(size: 72),
          const SizedBox(height: AwaTheme.gapL),
        ] else if (icon != null) ...[
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: scheme.primary.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 30, color: scheme.primary),
          ),
          const SizedBox(height: AwaTheme.gapL),
        ],
        Text(
          title,
          textAlign: TextAlign.center,
          style: text.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: AwaTheme.gapS),
          Text(
            subtitle!,
            textAlign: TextAlign.center,
            style: text.bodyMedium?.copyWith(color: scheme.onSurfaceVariant, height: 1.4),
          ),
        ],
      ],
    );
  }
}

/// Centered, max-width column that scrolls — the shared canvas for auth pages.
class CenteredScroll extends StatelessWidget {
  final List<Widget> children;
  const CenteredScroll({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 460),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
          children: children,
        ),
      ),
    );
  }
}

/// A compact stat/row used inside cards (label on the left, value on the right).
class InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const InfoRow({super.key, required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    return Row(
      children: [
        Icon(icon, size: 20, color: scheme.onSurfaceVariant),
        const SizedBox(width: AwaTheme.gapS + AwaTheme.gapXs),
        Expanded(
          child: Text(label, style: text.bodyMedium?.copyWith(color: scheme.onSurfaceVariant)),
        ),
        Text(value, style: text.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
      ],
    );
  }
}
