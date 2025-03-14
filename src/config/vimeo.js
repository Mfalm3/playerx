// https://github.com/vimeo/player.js
export const type = 'iframe'
export const key = 'vimeo'
export const name = 'Vimeo'
export const url = 'https://vimeo.com'
export const srcPattern = 'vimeo\\.com/(?:video/)?(\\d+)'
export const getEmbedUrl = (opts) => {
  // Create base embed URL
  let embedUrl = `https://player.vimeo.com/video/${opts.metaId}?${opts.params}`;
  
  // Try to extract hash parameter from original source URL
  try {
    const srcUrl = new URL(opts.src);
    const hParam = srcUrl.searchParams.get('h');
    if (hParam) {
      // Add the h parameter to the embed URL if it exists
      embedUrl += embedUrl.includes('?') ? '&' : '?';
      embedUrl += `h=${hParam}`;
    }
  } catch (e) {
    console.error('Failed to parse Vimeo URL', e);
  }
  
  return embedUrl;
}
// export const embedUrl = 'https://player.vimeo.com/video/{{metaId}}?{{params}}'
export const embedUrl = '{{getEmbedUrl}}'
export const pkg = '@vimeo/player'
export const jsUrl = '{{npmCdn}}/{{pkg}}@{{version}}/dist/player.min.js'
export const apiVar = 'Vimeo'
export const version = '2.16.2'
export const html = '{{iframe}}'
export const scriptText = `{{callback}}(new {{apiVar}}.Player({{node}}));`
