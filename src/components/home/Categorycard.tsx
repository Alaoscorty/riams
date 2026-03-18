"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
}

export function CategoryCard({ id, name, image }: CategoryCardProps) {
  return (
    <Link href={`/menu?category=${id}`}>
      <Card className="group relative overflow-hidden h-64 border-none cursor-pointer bg-muted">
        {image && (
          <Image 
            src={image} 
            alt={name} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
        <CardContent className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between text-white">
          <h3 className="text-2xl font-headline font-bold">{name}</h3>
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
            <ArrowRight className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
