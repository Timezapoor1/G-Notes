// Public settings only. The Supabase anon key is designed to be public;
// never put a service-role key or any other secret in this file.
//
//   provider: 'local'     accounts kept on this device (default, not secure)
//   provider: 'supabase'  real accounts online - fill in the two values below
window.GNOTES_CONFIG = {
  provider: 'supabase',
  supabaseUrl: 'https://emzqnisaswcslhjiimva.supabase.co',   // e.g. https://abcdefgh.supabase.co
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtenFuaXNhc3djc2xoamlpbXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MzQ5MDksImV4cCI6MjEwOTMxMDkwOX0.hxTZZ1k7x0iK_pN9Zk_9bEzzYaXeW_C8Hyk0vBFPhXg'    // the project's public "anon" key
};
