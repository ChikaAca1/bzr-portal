import { LandingNav } from '@/components/layout/LandingNav';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';
import { Sparkles, Smartphone, Shield, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * FeaturesPage - Detailed feature descriptions
 *
 * Phase 7 implementation
 */
export function FeaturesPage() {
  const { features } = landingContentSr;

  const featureSections = [
    {
      icon: Sparkles,
      title: features.sections.riskAssessment.title,
      description: features.sections.riskAssessment.description,
      features: features.sections.riskAssessment.features,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Smartphone,
      title: features.sections.mobileFirst.title,
      description: features.sections.mobileFirst.description,
      features: features.sections.mobileFirst.features,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
    },
    {
      icon: Users,
      title: features.sections.multiTenancy.title,
      description: features.sections.multiTenancy.description,
      features: features.sections.multiTenancy.features,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
    },
    {
      icon: Shield,
      title: features.sections.security.title,
      description: features.sections.security.description,
      features: features.sections.security.features,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{features.pageTitle}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {features.pageDescription}
            </p>
          </div>
        </section>

        {/* Feature Sections */}
        {featureSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <section
              key={index}
              className={`py-16 px-4 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
            >
              <div className="container mx-auto max-w-4xl">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-8 w-8 ${section.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                    <p className="text-lg text-muted-foreground mb-6">{section.description}</p>

                    <ul className="space-y-3">
                      {section.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <svg
                            className={`h-6 w-6 flex-shrink-0 mt-0.5 ${section.color}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Спремни да искуситепуну функционалност?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Почните бесплатан Trial од 14 дана - без кредитне картице.
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-primary-foreground text-primary rounded-md hover:bg-primary-foreground/90 transition-colors font-semibold"
            >
              Почните бесплатно
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
