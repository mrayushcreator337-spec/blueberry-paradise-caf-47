export function optimizedImage(url:string,width=1000){
 try{const u=new URL(url);if(u.protocol!=='https:')return '';if(u.hostname==='res.cloudinary.com'&&u.pathname.includes('/image/upload/')&&!u.pathname.includes('/image/upload/f_auto'))u.pathname=u.pathname.replace('/image/upload/',`/image/upload/f_auto,q_auto,w_${Math.min(1600,Math.max(200,width))}/`);return u.href;}catch{return url.startsWith('/')?url:'';}
}
// Cloudinary delivery works with owner-provided URLs; no account or upload preset is invented.
