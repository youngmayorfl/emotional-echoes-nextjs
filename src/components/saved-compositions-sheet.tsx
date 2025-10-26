
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Composition } from '@/components/mood-canvas';
import { Trash2, Upload } from 'lucide-react';

interface SavedCompositionsSheetProps {
  compositions: Composition[];
  onLoad: (composition: Composition) => void;
  onDelete: (id: string) => void;
}

export default function SavedCompositionsSheet({
  compositions,
  onLoad,
  onDelete,
}: SavedCompositionsSheetProps) {
  return (
    <SheetContent className="w-full md:w-[400px] sm:max-w-none flex flex-col">
      <SheetHeader>
        <SheetTitle className="font-headline text-2xl">Saved Echoes</SheetTitle>
        <SheetDescription>
          Revisit your previously generated art and soundscapes.
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4 -mr-6">
          {compositions.length > 0 ? (
            <div className="space-y-4">
              {compositions.map((comp) => (
                <Card key={comp.id} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-1/3 relative">
                      <Image
                        src={comp.artDataUri}
                        alt={`Art for ${comp.mood}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="w-2/3">
                      <CardHeader>
                        <CardTitle className="font-headline capitalize text-lg">{comp.mood}</CardTitle>
                        <CardDescription>Saved on {new Date(comp.id).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex gap-2">
                        <Button size="sm" onClick={() => onLoad(comp)} className="flex-1">
                          <Upload className="mr-2 h-4 w-4" /> Load
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(comp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground">You have no saved compositions yet.</p>
              <p className="text-sm text-muted-foreground">Generate and save a canvas to see it here.</p>
            </div>
          )}
        </ScrollArea>
      </div>
      <SheetFooter>
         <p className="text-xs text-muted-foreground text-center w-full">You have {compositions.length} saved composition(s).</p>
      </SheetFooter>
    </SheetContent>
  );
}
