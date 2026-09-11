import type { Order } from './types';

// Audio path pointing to existing public audio asset
const ORDER_ALERT_AUDIO_SRC = '/alerts/order ring.mp3';

// Browser-safe repeating order alert player using public/alerts/order ring.mp3
class OrderAlertManager {
  private audio: HTMLAudioElement | null = null;
  private intervalId: number | null = null;
  private isRinging: boolean = false;
  private unlocked: boolean = false;

  private getAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.audio) {
      this.audio = new Audio(encodeURI(ORDER_ALERT_AUDIO_SRC));
      this.audio.preload = 'auto';
    }
    return this.audio;
  }

  // Attempt to unlock audio playback permission on user interaction
  public async unlock(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const audio = this.getAudio();
    if (!audio) return false;

    if (this.unlocked) return true;

    try {
      if (this.isRinging) {
        audio.volume = 1;
        audio.currentTime = 0;
        await audio.play();
        this.unlocked = true;
        return true;
      }

      // Briefly initiate silent playback to satisfy browser autoplay policy
      const prevVolume = audio.volume;
      audio.volume = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      audio.pause();
      audio.currentTime = 0;
      audio.volume = prevVolume || 1;
      this.unlocked = true;
      return true;
    } catch (err) {
      audio.volume = 1;
      console.warn('[OrderAlertSound] Autoplay unlock error:', err);
      return false;
    }
  }

  public isUnlocked(): boolean {
    return this.unlocked;
  }

  // Play the order alert MP3 from the beginning
  public playSound() {
    const audio = this.getAudio();
    if (!audio) return;

    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.unlocked = true;
          })
          .catch((err) => {
            if (err?.name !== 'AbortError') {
              console.warn('[OrderAlertSound] Audio playback blocked or pending user interaction:', err);
            }
          });
      }
    } catch (err) {
      console.warn('[OrderAlertSound] Audio play exception:', err);
    }
  }

  // Alias for backward compatibility
  public playChime() {
    this.playSound();
  }

  // Start continuous repeating ring (defaults to every 2 seconds)
  public startRinging(intervalMs: number = 2000) {
    if (this.isRinging) return;
    this.isRinging = true;

    // Try unlocking immediately
    this.unlock().catch(() => {});

    // Play first ring immediately
    this.playSound();

    // Loop every intervalMs (defaults to 2000ms / 2s)
    this.intervalId = window.setInterval(() => {
      this.playSound();
    }, intervalMs);
  }

  // Stop ringing and reset audio immediately
  public stopRinging() {
    this.isRinging = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {
        // ignore
      }
    }
  }

  public getIsRinging(): boolean {
    return this.isRinging;
  }

  public cleanup() {
    this.stopRinging();
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.removeAttribute('src');
        this.audio.load();
      } catch {
        // ignore
      }
      this.audio = null;
    }
  }
}

export const orderAlertPlayer = new OrderAlertManager();

// Browser notification utilities
export function requestNotificationPermission(): void {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

export function showBrowserOrderNotification(order: Order): void {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const typeLabel = order.order_type === 'dine_in' ? `Dine In (Table ${order.table_number || '-'})` : 'Takeaway';
      new Notification(`🔔 New Order #${order.order_number}`, {
        body: `${order.customer_name} • ₹${order.total} • ${typeLabel}`,
        icon: '/images/logo.png',
        tag: `order-${order.id}`,
      });
    } catch {
      // ignore
    }
  }
}
