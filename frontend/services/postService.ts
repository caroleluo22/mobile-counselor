import { ForumPost, ForumReply } from '../types';

const API_URL = '/api/posts';

export const fetchPosts = async (page: number = 1): Promise<{ posts: ForumPost[], hasMore: boolean }> => {
    const response = await fetch(`${API_URL}?page=${page}&limit=5`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch posts');
    const data = await response.json();
    // Convert date strings to Date objects
    const formattedPosts = data.posts.map((post: any) => ({
        ...post,
        timestamp: new Date(post.createdAt),
        replies: post.replies.map((r: any) => ({ ...r, timestamp: new Date(r.createdAt) }))
    }));

    return { posts: formattedPosts, hasMore: data.currentPage < data.totalPages };
};

export const createPost = async (postData: { title: string; content: string; category: string }): Promise<ForumPost> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error('Failed to create post');
    const post = await response.json();
    return { ...post, timestamp: new Date(post.createdAt) };
};

export const addReply = async (postId: string, content: string): Promise<ForumPost> => {
    const response = await fetch(`${API_URL}/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to add reply');
    const post = await response.json();
    return { ...post, timestamp: new Date(post.createdAt) };
};

export const updateWithAIReply = async (postId: string, aiReply: string): Promise<ForumPost> => {
    const response = await fetch(`${API_URL}/${postId}/ai-reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ aiReply }),
    });
    if (!response.ok) throw new Error('Failed to update with AI reply');
    const post = await response.json();
    return { ...post, timestamp: new Date(post.createdAt) };
};