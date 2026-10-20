// Public settings only. The Supabase anon key is designed to be public;
// never put a service-role key or any other secret in this file.
//
//   provider: 'local'     accounts kept on this device (default, not secure)
//   provider: 'supabase'  real accounts online - fill in the two values below
window.GNOTES_CONFIG = {
  provider: 'local',
  supabaseUrl: '',   // e.g. https://abcdefgh.supabase.co
  supabaseKey: ''    // the project's public "anon" key
};
