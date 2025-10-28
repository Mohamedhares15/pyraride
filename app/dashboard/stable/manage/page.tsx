"use client";

import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ManageStable() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 font-display text-4xl font-bold tracking-tight">
                Manage Stable
              </h1>
              <p className="text-muted-foreground">
                Manage your stable details and horses
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/stable">
                ← Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Stable Info */}
        <Card className="mb-8 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Stable Information</h2>
            <Button variant="outline">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Stable Name</p>
              <p className="font-medium">Pyramid View Stables</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium capitalize">Giza</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                Approved
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">123 Pyramid Road, Giza, Egypt</p>
            </div>
          </div>
        </Card>

        {/* Horses */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Horses</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Horse
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Horse Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Desert Wind</h3>
                      <p className="text-sm text-muted-foreground">
                        Active
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    Active
                  </Badge>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  A beautiful Arabian horse, gentle and experienced with tourists.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Another Horse */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Sahara Queen</h3>
                      <p className="text-sm text-muted-foreground">
                        Active
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    Active
                  </Badge>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  An elegant mare with stunning brown coat. Expertly trained for pyramid tours.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

