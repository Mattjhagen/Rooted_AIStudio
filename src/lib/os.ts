export const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.rooteddaily.bible&hl=en_US';
export const IOS_URL = 'https://apps.apple.com/us/app/rooted-daily/id6763426267';

export function getDownloadLink() {
  if (typeof window === 'undefined') return ANDROID_URL;
  
  const ua = navigator.userAgent.toLowerCase();
  
  if (ua.indexOf('android') > -1) {
    return ANDROID_URL;
  }
  
  if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1 || ua.indexOf('ipod') > -1) {
    return IOS_URL;
  }
  
  // Default for Desktop/Others: You could return a specific page, 
  // but for now we'll default to Android as a fallback or return an object for UI handling.
  return ANDROID_URL;
}
