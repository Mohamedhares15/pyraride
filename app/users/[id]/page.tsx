"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    MapPin, Calendar, Star, Users, Grid, Image as ImageIcon,
    MessageSquare, Heart, Share2, Settings, UserPlus, UserCheck,
    Camera, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { useRouter } from "next/navigation";

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
            setProfile(data.user);
        } catch (err) {
            console.error(err);
            setError("Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    }

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
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="pb-20">
                {/* Cover Image (Placeholder for now as DB doesn't have coverImage yet) */}
                <div className="h-64 md:h-80 w-full relative overflow-hidden bg-zinc-900">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-black/80"></div>
                </div>

                <div className="container mx-auto px-4 -mt-20 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                        {/* Profile Image */}
                        <div className="relative">
                            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-black overflow-hidden bg-zinc-800 shadow-xl">
                                <Avatar className="h-full w-full">
                                    <AvatarImage src={profile.profileImageUrl || ""} alt={profile.fullName} className="object-cover" />
                                    <AvatarFallback className="text-2xl bg-zinc-800">{profile.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            {session?.user?.id === profile.id && (
                                <button className="absolute bottom-2 right-2 p-2 bg-primary rounded-full text-white shadow-lg hover:bg-primary/90 transition-colors">
                                    <Camera className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 mb-4 md:mb-0">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                                <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                                {profile.role === "stable_owner" && (
                                    <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/50">Stable Owner</Badge>
                                )}
                                {profile.role === "admin" && (
                                    <Badge className="bg-red-500/20 text-red-500 border-red-500/50">Admin</Badge>
                                )}
                            </div>
                            <p className="text-zinc-400 mb-4 max-w-2xl">{profile.bio || "No bio yet."}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                                {profile.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        {profile.location}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4 md:mt-0">
                            {session?.user?.id === profile.id ? (
                                <Button variant="outline" className="gap-2 border-zinc-700 hover:bg-zinc-800">
                                    <Settings className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={toggleFollow}
                                        className={`gap-2 ${profile.isFollowing
                                            ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                                            : "bg-primary hover:bg-primary/90 text-white"}`}
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
                                    <Button variant="outline" size="icon" className="border-zinc-700 hover:bg-zinc-800">
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="border-zinc-700 hover:bg-zinc-800">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-zinc-900/50 border-zinc-800 p-4 text-center hover:bg-zinc-900 transition-colors">
                            <div className="text-2xl font-bold text-white mb-1">{profile.stats.rides}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Rides Completed</div>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800 p-4 text-center hover:bg-zinc-900 transition-colors cursor-pointer">
                            <div className="text-2xl font-bold text-white mb-1">{profile.stats.followers}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Followers</div>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800 p-4 text-center hover:bg-zinc-900 transition-colors cursor-pointer">
                            <div className="text-2xl font-bold text-white mb-1">{profile.stats.following}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Following</div>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800 p-4 text-center hover:bg-zinc-900 transition-colors">
                            <div className="text-2xl font-bold text-white mb-1">{profile.stats.reviews}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Reviews</div>
                        </Card>
                    </div>

                    {/* Content Tabs */}
                    <Tabs defaultValue="posts" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="w-full justify-start bg-transparent border-b border-zinc-800 rounded-none h-auto p-0 mb-6">
                            <TabsTrigger
                                value="posts"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 gap-2"
                            >
                                <Grid className="h-4 w-4" />
                                Posts
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 gap-2"
                            >
                                <Star className="h-4 w-4" />
                                Reviews
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="mt-0">
                            {profile.userPosts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {profile.userPosts.map((post) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg bg-zinc-900"
                                        >
                                            <img
                                                src={post.imageUrl}
                                                alt="Post"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                                                <div className="flex items-center gap-2">
                                                    <Heart className="h-6 w-6 fill-white" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Add Post Button (Only for owner) */}
                                    {session?.user?.id === profile.id && (
                                        <div className="aspect-square rounded-lg border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 hover:bg-zinc-900/50 transition-all cursor-pointer">
                                            <Camera className="h-8 w-8 mb-2" />
                                            <span className="font-medium">Add Photo</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-zinc-500">
                                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No posts yet</p>
                                    {session?.user?.id === profile.id && (
                                        <Button variant="outline" className="mt-4 border-zinc-700">Create your first post</Button>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-0">
                            <div className="grid gap-4">
                                {profile.reviews.length > 0 ? profile.reviews.map((review) => (
                                    <Card key={review.id} className="bg-zinc-900/50 border-zinc-800 p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-white">{review.stable.name}</h3>
                                                <div className="flex items-center gap-1 text-amber-400 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < review.stableRating ? "fill-current" : "text-zinc-700"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-sm text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-zinc-300">{review.comment}</p>
                                    </Card>
                                )) : (
                                    <div className="text-center py-10 text-zinc-500">
                                        <p>No reviews yet</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
}
