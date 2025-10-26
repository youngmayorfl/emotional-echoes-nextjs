
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';

import { getArtForMoodAction, getSoundForMoodAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LoaderCircle, Music, Save, Sparkles, Library } from 'lucide-react';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import SavedCompositionsSheet from '@/components/saved-compositions-sheet';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';

export type Composition = {
  id: string;
  mood: string;
  artDataUri: string;
  soundDataUri: string;
};

const formSchema = z.object({
  mood: z.string().min(2, {
    message: "Please describe your mood in at least 2 characters.",
  }),
});

export default function MoodCanvas() {
  const [mood, setMood] = useState('');
  const [artDataUri, setArtDataUri] = useState<string | null>(PlaceHolderImages[0]?.imageUrl || null);
  const [soundDataUri, setSoundDataUri] = useState<string | null>(null);

  const [complexity, setComplexity] = useState(100);
  const [intensity, setIntensity] = useState(100);

  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [isGeneratingSound, setIsGeneratingSound] = useState(false);
  
  const [savedCompositions, setSavedCompositions] = useState<Composition[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "",
    },
  });

  useEffect(() => {
    try {
      const items = localStorage.getItem('emotional-echoes-compositions');
      if (items) {
        setSavedCompositions(JSON.parse(items));
      }
    } catch (error) {
      console.error("Failed to load compositions from localStorage", error);
    }
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGeneratingArt(true);
    setArtDataUri(null);
    setSoundDataUri(null);
    setMood(values.mood);

    const result = await getArtForMoodAction(values.mood);

    if (result.artDataUri) {
      setArtDataUri(result.artDataUri);
      toast({
        title: 'Canvas Generated',
        description: `Your canvas for "${values.mood}" is ready.`,
      });
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Art Generation Failed',
        description: result.error,
      });
      setArtDataUri(PlaceHolderImages[0]?.imageUrl || null);
    }
    setIsGeneratingArt(false);
  };

  const handleGenerateSound = async () => {
    if (!mood) return;
    setIsGeneratingSound(true);
    const result = await getSoundForMoodAction(mood);
    if (result.soundDataUri) {
      setSoundDataUri(result.soundDataUri);
      toast({
        title: 'Soundscape Generated',
        description: `An ambient soundscape for "${mood}" is now playing.`,
      });
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Sound Generation Failed',
        description: result.error,
      });
    }
    setIsGeneratingSound(false);
  };

  const handleSaveComposition = () => {
    if (!artDataUri || !soundDataUri || !mood || artDataUri.startsWith('https://picsum.photos')) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save',
        description: 'Please generate both art and a soundscape before saving.',
      });
      return;
    }
    const newComposition: Composition = {
      id: new Date().toISOString(),
      mood,
      artDataUri,
      soundDataUri,
    };
    const updatedCompositions = [...savedCompositions, newComposition];
    setSavedCompositions(updatedCompositions);
    localStorage.setItem('emotional-echoes-compositions', JSON.stringify(updatedCompositions));
    toast({
      title: 'Composition Saved',
      description: `Your masterpiece for "${mood}" has been saved.`,
    });
  };

  const handleLoadComposition = (composition: Composition) => {
    setMood(composition.mood);
    setArtDataUri(composition.artDataUri);
    setSoundDataUri(composition.soundDataUri);
    setComplexity(100);
    setIntensity(100);
    form.setValue('mood', composition.mood);
    setIsSheetOpen(false);
    toast({
      title: 'Composition Loaded',
      description: `Now viewing your canvas for "${composition.mood}".`,
    });
  };

  const handleDeleteComposition = (id: string) => {
    const updatedCompositions = savedCompositions.filter(c => c.id !== id);
    setSavedCompositions(updatedCompositions);
    localStorage.setItem('emotional-echoes-compositions', JSON.stringify(updatedCompositions));
    toast({
      title: 'Composition Deleted',
    });
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="relative flex flex-col h-screen p-4 md:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-3xl md:text-4xl font-headline text-primary">Emotional Echoes</h1>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Library className="h-6 w-6" />
              <span className="sr-only">Open Saved Compositions</span>
            </Button>
          </SheetTrigger>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 h-[calc(100%-80px)]">
          {/* Control Panel */}
          <div className="md:col-span-1 lg:col-span-1 bg-card/50 p-6 rounded-lg shadow-md flex flex-col space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline">Create Your Canvas</h2>
              <p className="text-sm text-muted-foreground">Tell us how you feel, and we'll craft a unique visual and auditory experience.</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="mood">Current Mood</Label>
                      <FormControl>
                        <Input id="mood" placeholder="e.g., serene, joyful, introspective" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isGeneratingArt}>
                  {isGeneratingArt ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
                  {isGeneratingArt ? 'Generating...' : 'Generate Art'}
                </Button>
              </form>
            </Form>

            <div className="space-y-6 pt-4 border-t">
              <div className="space-y-4">
                <Label>Adjust Complexity</Label>
                <Slider defaultValue={[100]} max={200} step={1} onValueChange={(value) => setComplexity(value[0])} disabled={isGeneratingArt || artDataUri?.startsWith('https://picsum.photos')} />
              </div>
              <div className="space-y-4">
                <Label>Adjust Color Intensity</Label>
                <Slider defaultValue={[100]} max={200} step={1} onValueChange={(value) => setIntensity(value[0])} disabled={isGeneratingArt || artDataUri?.startsWith('https://picsum.photos')} />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t flex-grow flex flex-col justify-end">
              <Button onClick={handleGenerateSound} className="w-full" disabled={isGeneratingSound || !mood || artDataUri?.startsWith('https://picsum.photos')}>
                {isGeneratingSound ? <LoaderCircle className="animate-spin" /> : <Music />}
                {isGeneratingSound ? 'Generating...' : 'Cycle Soundscape'}
              </Button>
              <Button onClick={handleSaveComposition} className="w-full" variant="outline" disabled={!artDataUri || !soundDataUri || artDataUri.startsWith('https://picsum.photos')}>
                <Save />
                Save Composition
              </Button>
              {soundDataUri && <audio key={soundDataUri} autoPlay controls src={soundDataUri} className="w-full mt-4" />}
            </div>
          </div>

          {/* Art Display */}
          <div className="md:col-span-2 lg:col-span-3 h-full flex items-center justify-center">
            <Card className="w-full h-full aspect-square max-w-full max-h-full shadow-2xl overflow-hidden bg-transparent border-0">
              <CardContent className="p-0 h-full w-full">
                <AnimatePresence>
                  {isGeneratingArt ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center bg-card/30">
                      <LoaderCircle className="w-16 h-16 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground font-headline text-xl">Generating your masterpiece...</p>
                    </motion.div>
                  ) : (
                    artDataUri && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
                        <Image
                          src={artDataUri}
                          alt={mood || 'Abstract art'}
                          fill
                          className="object-cover transition-all duration-500 ease-in-out"
                          style={{
                            filter: `contrast(${complexity}%) saturate(${intensity}%)`,
                          }}
                          data-ai-hint="abstract pattern"
                        />
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <SavedCompositionsSheet
        compositions={savedCompositions}
        onLoad={handleLoadComposition}
        onDelete={handleDeleteComposition}
      />
    </Sheet>
  );
}
