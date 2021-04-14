/**
 * INFO: Simple utility to generate sitemaps
 */
import {render} from "https://deno.land/x/eta/mod.ts";

const sitemapTemplate = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>
    <% it.links.forEach(function(link){ %>
    <url>
        <loc><%= link.url %></loc>
        <lastmod><%= link.modified %></lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.3</priority>
    </url>
    <% }) %>
</urlset>
`

interface SitemapEntry {
    url: string,
    modified: string
}

/**
 * Generate a sitemap's XML by providing a list of {@see SitemapEntry }.
 * @param base URL base
 * @param links An array of {@see SitemapEntry}
 */
export function renderSitemap(links: Array<SitemapEntry>): string {
    return render(sitemapTemplate, {
        links: links
    }, {async: false, autoEscape: false}) as string;

}