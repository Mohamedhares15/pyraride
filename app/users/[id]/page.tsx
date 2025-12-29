"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    MapPin, Calendar, Star, Users, Grid, Image as ImageIcon,
    MessageSquare, Heart, Share2, Settings, UserPlus, UserCheck,
    Camera, MoreHorizontal, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { useRouter } from "next/navigation";
import CreatePostModal from "@/components/shared/CreatePostModal";
import EditProfileDialog from "@/components/users/EditProfileDialog";
import FollowersList from "@/components/users/FollowersList";

interface UserProfileData {
    id: string;
    fullName: string;
    role: string;
    bio: string | null;
    location: string | null;
    createdAt: string;
    profileImageUrl: string | null;
    stats: {
        rides: number;
        followers: number;
        following: number;
        reviews: number;
        posts: number;
    };
    userPosts: {
        id: string;
        imageUrl: string;
        caption: string | null;
        _count: { likes: number };
        likes: { userId: string }[];
        isLiked?: boolean; // Client-side state
        likeCount?: number; // Client-side state
    }[];
    reviews: {
        id: string;
        stable: { name: string };
        stableRating: number;
        comment: string | null;
        createdAt: string;
    }[];
    isFollowing: boolean;
}

export default function UserProfile({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("posts");
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [error, setError] = useState("");
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isFollowersListOpen, setIsFollowersListOpen] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("Image must be smaller than 10MB");
            return;
        }

        try {
            setIsUploadingImage(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;

                const response = await fetch("/api/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ profileImageDataUrl: base64String }),
                });

                if (!response.ok) throw new Error("Failed to upload image");

                const data = await response.json();
                setProfile(prev => prev ? { ...prev, profileImageUrl: data.user.profileImageUrl } : null);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image");
        } finally {
            setIsUploadingImage(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [params.id]);

    async function fetchProfile() {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/users/${params.id}/profile`);
            if (!response.ok) {
                if (response.status === 404) throw new Error("User not found");
                throw new Error("Failed to fetch profile");
            }
            const data = await response.json();
            // Map initial state
            const postsWithState = data.user.userPosts.map((post: any) => ({
                ...post,
                isLiked: post.likes.length > 0,
                likeCount: post._count.likes
            }));
            setProfile({ ...data.user, userPosts: postsWithState });
        } catch (err) {
            console.error(err);
            setError("Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    }

    const togglePostLike = async (postId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session) {
            router.push("/signin");
            return;
        }

        if (!profile) return;

        // Optimistic update
        setProfile(prev => {
            if (!prev) return null;
            return {
                ...prev,
                userPosts: prev.userPosts.map(post => {
                    if (post.id === postId) {
                        const isLiked = !post.isLiked;
                        return {
                            ...post,
                            isLiked,
                            likeCount: (post.likeCount || 0) + (isLiked ? 1 : -1)
                        };
                    }
                    return post;
                })
            };
        });

        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: "POST"
            });

            if (!response.ok) {
                // Revert
                setProfile(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        userPosts: prev.userPosts.map(post => {
                            if (post.id === postId) {
                                const isLiked = !post.isLiked;
                                return {
                                    ...post,
                                    isLiked,
                                    likeCount: (post.likeCount || 0) + (isLiked ? 1 : -1)
                                };
                            }
                            return post;
                        })
                    };
                });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const toggleFollow = async () => {
        if (!session) {
            router.push("/signin");
            return;
        }

        if (!profile) return;

        // Optimistic update
        const newIsFollowing = !profile.isFollowing;
        setProfile(prev => prev ? {
            ...prev,
            isFollowing: newIsFollowing,
            stats: {
                ...prev.stats,
                followers: prev.stats.followers + (newIsFollowing ? 1 : -1)
            }
        } : null);

        try {
            const response = await fetch(`/api/users/${params.id}/follow`, {
                method: "POST"
            });

            if (!response.ok) {
                // Revert on error
                setProfile(prev => prev ? {
                    ...prev,
                    isFollowing: !newIsFollowing,
                    stats: {
                        ...prev.stats,
                        followers: prev.stats.followers + (!newIsFollowing ? 1 : -1)
                    }
                } : null);
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <h2 className="text-xl font-bold">User not found</h2>
                <Button onClick={() => router.push("/")}>Return Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
            <Navbar />

            <main className="pb-20">
                {/* Cover Image */}
                <div className="h-64 md:h-80 w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/hero-bg.webp')] bg-cover bg-center opacity-30 blur-sm"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
                </div>

                <div className="container mx-auto px-4 -mt-24 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                        {/* Profile Image */}
                        <div className="relative group">
                            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-black overflow-hidden bg-zinc-800 shadow-2xl ring-4 ring-white/5">
                                <Avatar className="h-full w-full">
                                    <AvatarImage src={profile.profileImageUrl || ""} alt={profile.fullName} className="object-cover" />
                                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-zinc-700 to-zinc-900">{profile.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            {session?.user?.id === profile.id && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={handleImageUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingImage}
                                        className="absolute bottom-2 right-2 p-2.5 bg-primary rounded-full text-white shadow-lg hover:bg-primary/90 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploadingImage ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : (
                                            <Camera className="h-4 w-4" />
                                        )}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 mb-4 md:mb-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{profile.fullName}</h1>
                                {profile.role === "stable_owner" && (
                                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1">Stable Owner</Badge>
                                )}
                                {profile.role === "admin" && (
                                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1">Admin</Badge>
                                )}
                            </div>
                            <p className="text-zinc-300 mb-4 max-w-2xl text-lg leading-relaxed">{profile.bio || "No bio yet."}</p>
                            <div className="flex flex-wrap gap-6 text-sm text-zinc-400 font-medium">
                                {profile.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        {profile.location}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
                            {session?.user?.id === profile.id ? (
                                <Button
                                    variant="outline"
                                    className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all flex-1 md:flex-none"
                                    onClick={() => setIsEditProfileOpen(true)}
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={toggleFollow}
                                        className={`gap-2 flex-1 md:flex-none transition-all ${profile.isFollowing
                                            ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                                            : "bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-white shadow-lg shadow-primary/20"}`}
                                    >
                                        {profile.isFollowing ? (
                                            <>
                                                <UserCheck className="h-4 w-4" />
                                                Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="h-4 w-4" />
                                                Follow
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                                        onClick={() => router.push(`/chat?userId=${profile.id}`)}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>

                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <Card className="bg-white/5 backdrop-blur-md border-white/5 p-5 text-center hover:bg-white/10 transition-all cursor-default group">
                            <div className="text-3xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{profile.stats.rides}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Rides</div>
                        </Card>
                        <Card
                            className="bg-white/5 backdrop-blur-md border-white/5 p-5 text-center hover:bg-white/10 transition-all cursor-pointer group"
                            onClick={() => setIsFollowersListOpen(true)}
                        >
                            <div className="text-3xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{profile.stats.followers}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Followers</div>
                        </Card>
                        <Card className="bg-white/5 backdrop-blur-md border-white/5 p-5 text-center hover:bg-white/10 transition-all cursor-pointer group">
                            <div className="text-3xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{profile.stats.following}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Following</div>
                        </Card>
                        <Card className="bg-white/5 backdrop-blur-md border-white/5 p-5 text-center hover:bg-white/10 transition-all cursor-default group">
                            <div className="text-3xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{profile.stats.reviews}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Reviews</div>
                        </Card>
                    </div>

                    {/* Content Tabs */}
                    <Tabs defaultValue="posts" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="w-full justify-start bg-transparent border-b border-white/10 rounded-none h-auto p-0 mb-8">
                            <TabsTrigger
                                value="posts"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-8 py-4 gap-2 text-zinc-400 hover:text-white transition-colors text-base"
                            >
                                <Grid className="h-4 w-4" />
                                Posts
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-8 py-4 gap-2 text-zinc-400 hover:text-white transition-colors text-base"
                            >
                                <Star className="h-4 w-4" />
                                Reviews
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="mt-0 focus-visible:outline-none">
                            {profile.userPosts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {session?.user?.id === profile.id && (
                                        <div
                                            onClick={() => setIsCreatePostOpen(true)}
                                            className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                                        >
                                            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                                                <Camera className="h-6 w-6" />
                                            </div>
                                            <span className="font-medium">Add New Post</span>
                                        </div>
                                    )}
                                    {profile.userPosts.map((post) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="aspect-square relative group cursor-pointer overflow-hidden rounded-xl bg-zinc-900"
                                        >
                                            <img
                                                src={post.imageUrl}
                                                alt="Post"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white backdrop-blur-sm">
                                                <div
                                                    className="flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform"
                                                    onClick={(e) => togglePostLike(post.id, e)}
                                                >
                                                    <Heart className={`h-8 w-8 drop-shadow-lg ${post.isLiked ? "fill-red-500 text-red-500" : "fill-white text-white"}`} />
                                                    <span className="font-bold text-lg">{post.likeCount}</span>
                                                </div>
                                            </div>
                                            {post.caption && (
                                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-sm text-white line-clamp-2">{post.caption}</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ImageIcon className="h-8 w-8 text-zinc-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                                    <p className="text-zinc-400 max-w-sm mx-auto mb-6">Share your riding moments with the community.</p>
                                    {session?.user?.id === profile.id && (
                                        <Button
                                            onClick={() => setIsCreatePostOpen(true)}
                                            className="bg-primary hover:bg-primary/90 text-white px-8"
                                        >
                                            Create your first post
                                        </Button>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-0 focus-visible:outline-none">
                            <div className="grid gap-4">
                                {profile.reviews.length > 0 ? profile.reviews.map((review) => (
                                    <Card key={review.id} className="bg-white/5 backdrop-blur-md border-white/5 p-6 hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-white text-lg mb-1">{review.stable.name}</h3>
                                                <div className="flex items-center gap-1 text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < review.stableRating ? "fill-current" : "text-zinc-700"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-sm text-zinc-500 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-zinc-300 leading-relaxed">{review.comment}</p>
                                    </Card>
                                )) : (
                                    <div className="text-center py-24 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Star className="h-8 w-8 text-zinc-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
                                        <p className="text-zinc-400">Book a ride and share your experience.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs >
                </div >
            </main >
            <Footer />

            {/* Modals */}
            <CreatePostModal
                isOpen={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
            />
            <EditProfileDialog
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                currentBio={profile.bio || ""}
                userId={profile.id}
            />
            <FollowersList
                userId={profile.id}
                isOpen={isFollowersListOpen}
                onClose={() => setIsFollowersListOpen(false)}
            />
        </div >
    );
}
