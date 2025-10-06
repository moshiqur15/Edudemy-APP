// Simple debug test
console.log('App is loading...');
console.log('Location:', window.location);
console.log('Local storage user:', localStorage.getItem('user'));
console.log('Local storage token:', localStorage.getItem('access_token'));

// Test if React is working
window.addEventListener('load', () => {
  console.log('Window loaded');
  const root = document.getElementById('root');
  console.log('Root element:', root);
  console.log('Root innerHTML:', root ? root.innerHTML : 'No root element found');
});