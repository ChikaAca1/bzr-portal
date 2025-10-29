import { LandingNav } from '@/components/layout/LandingNav';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';
import { Target, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * AboutPage - Company information
 *
 * Phase 7 implementation
 */
export function AboutPage() {
  const { about } = landingContentSr;

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{about.pageTitle}</h1>
            <p className="text-xl text-muted-foreground">
              {about.pageDescription}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">{about.mission.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {about.mission.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-blue-600/10 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">{about.story.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {about.story.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-purple-600/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">{about.team.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {about.team.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Наше вредности</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-background border border-border rounded-lg">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-2">Иновације</h3>
                <p className="text-muted-foreground">
                  Користимо најновије AI технологије да бисмо унапредили безбедност на раду.
                </p>
              </div>
              <div className="text-center p-6 bg-background border border-border rounded-lg">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Усклађеност</h3>
                <p className="text-muted-foreground">
                  Све што радимо је у складу са српским законима о БЗР.
                </p>
              </div>
              <div className="text-center p-6 bg-background border border-border rounded-lg">
                <div className="text-4xl mb-4">💚</div>
                <h3 className="text-xl font-semibold mb-2">Једноставност</h3>
                <p className="text-muted-foreground">
                  Сложене процесе претварамо у интуитивна решења.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Придружите се нашој мисији
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Постаните део заједнице која модернизује безбедност на раду у Србији.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-block px-8 py-3 bg-primary-foreground text-primary rounded-md hover:bg-primary-foreground/90 transition-colors font-semibold"
              >
                Почните бесплатно
              </Link>
              <Link
                to="/contact"
                className="inline-block px-8 py-3 border-2 border-primary-foreground rounded-md hover:bg-primary-foreground/10 transition-colors font-semibold"
              >
                Контактирајте нас
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
