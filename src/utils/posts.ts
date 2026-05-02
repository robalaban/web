export async function getLatestPostDate(): Promise<string> {
    const posts = await Promise.all(
        Object.values(await import.meta.glob('../pages/posts/*.md', { eager: true }))
    );
    
    if (posts.length === 0) {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Sort posts by publish date (newest first)
    const sortedPosts = posts.sort((a: any, b: any) => {
        return new Date(b.frontmatter.publishDate).getTime() - 
               new Date(a.frontmatter.publishDate).getTime();
    });
    
    // Get the latest post date
    const latestPost = sortedPosts[0] as any;
    return latestPost.frontmatter.publishDate;
} 