import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

/**
 * Pricing Section - Godišnje/Kvartalno/Mesečno sa klizačem
 *
 * Struktura:
 * - Do 20 zaposlenih: SAMO godišnje
 * - 50+ zaposlenih: kvartalno i godišnje
 * - Inicijalno: godišnja pretplata
 *
 * Cene po broju zaposlenih (mesečni iznos):
 * - Do 10: 2500 godišnje
 * - Do 20: 3000 godišnje
 * - Do 50: 5000 godišnje, 6250 kvartalno
 * - Do 200: 15000 godišnje, 18750 kvartalno
 * - Preko 200: 25000 godišnje, 31250 kvartalno
 */

type BillingPeriod = 'yearly' | 'quarterly' | 'monthly';

interface PricingTier {
  employees: string;
  yearlyPerMonth: number;
  quarterlyPerMonth?: number;
  monthlyPrice?: number;
  features: string[];
  recommended?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    employees: 'До 10 запослених',
    yearlyPerMonth: 2500,
    features: [
      'Неограничен број докумената',
      'АИ асистент за креирање',
      'Аутоматске измене прописа',
      'Безбедно складиштење',
      'Подршка путем имејла',
    ],
  },
  {
    employees: 'До 20 запослених',
    yearlyPerMonth: 3000,
    recommended: true,
    features: [
      'Све из претходног пакета',
      'Приоритетна подршка',
      'Обрасци за све запослене',
      'Извештаји и аналитика',
      'Подсетници за рокове',
    ],
  },
  {
    employees: 'До 50 запослених',
    yearlyPerMonth: 5000,
    quarterlyPerMonth: 6250,
    features: [
      'Све из претходног пакета',
      'Дедиковани менаџер налога',
      'Обуке за запослене',
      'Прилагођени обрасци',
      'АПИ интеграција',
    ],
  },
  {
    employees: 'До 200 запослених',
    yearlyPerMonth: 15000,
    quarterlyPerMonth: 18750,
    features: [
      'Све из претходног пакета',
      'Мулти-локацијска подршка',
      'Напредна аналитика',
      'СЛА гаранција',
      '24/7 подршка',
    ],
  },
  {
    employees: 'Преко 200 запослених',
    yearlyPerMonth: 25000,
    quarterlyPerMonth: 31250,
    features: [
      'Све из претходног пакета',
      'Ентерпрајз решења',
      'Прилагођени развој',
      'Он-премисе опција',
      'Посвећени тим',
    ],
  },
];

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto px-4 xs:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Изаберите план који вам одговара
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Транспарентне цене. Без скривених трошкова. Уштедите више уз дуже претплате.
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-background border border-border rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Годишње
              <span className="ml-2 text-xs">(Највећа уштеда)</span>
            </button>
            <button
              onClick={() => setBillingPeriod('quarterly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'quarterly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Квартално
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {pricingTiers.map((tier, index) => {
            // Check if this billing period is available for this tier
            const isQuarterlyAvailable = tier.quarterlyPerMonth !== undefined;
            const canShowThisPeriod =
              billingPeriod === 'yearly' || (billingPeriod === 'quarterly' && isQuarterlyAvailable);

            if (!canShowThisPeriod) {
              return (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-muted/50 p-6 opacity-60"
                >
                  <h3 className="text-lg font-bold mb-4">{tier.employees}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Доступно само на годишњој претплати
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Није доступно
                  </Button>
                </div>
              );
            }

            const pricePerMonth =
              billingPeriod === 'yearly' ? tier.yearlyPerMonth : tier.quarterlyPerMonth!;
            const totalPrice =
              billingPeriod === 'yearly' ? pricePerMonth * 12 : pricePerMonth * 3;

            return (
              <div
                key={index}
                className={`rounded-lg p-6 h-full flex flex-col transition-all duration-300 ${
                  tier.recommended
                    ? 'bg-primary text-primary-foreground shadow-2xl scale-105 border-2 border-primary'
                    : 'bg-background border border-border hover:shadow-lg'
                }`}
              >
                {/* Badge */}
                {tier.recommended && (
                  <div className="inline-block px-3 py-1 bg-primary-foreground text-primary text-xs font-semibold rounded-full mb-4 self-start">
                    Најпопуларније
                  </div>
                )}

                {/* Tier Name */}
                <h3
                  className={`text-xl font-bold mb-4 ${tier.recommended ? '' : 'text-foreground'}`}
                >
                  {tier.employees}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-3xl font-bold ${tier.recommended ? '' : 'text-foreground'}`}
                    >
                      {pricePerMonth.toLocaleString('sr-RS')}
                    </span>
                    <span
                      className={`text-sm ${
                        tier.recommended ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      РСД/мес
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      tier.recommended ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {billingPeriod === 'yearly'
                      ? `${totalPrice.toLocaleString('sr-RS')} РСД годишње`
                      : `${totalPrice.toLocaleString('sr-RS')} РСД квартално`}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check
                        className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                          tier.recommended ? 'text-primary-foreground' : 'text-primary'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-xs ${tier.recommended ? '' : 'text-foreground'}`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  variant={tier.recommended ? 'secondary' : 'default'}
                  className="w-full"
                >
                  <Link to="/register">Почните сада</Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Savings Comparison */}
        <div className="text-center bg-background border border-border rounded-lg p-6 max-w-3xl mx-auto">
          <p className="font-semibold mb-2">💰 Колико уштедите?</p>
          <p className="text-sm text-muted-foreground">
            Годишња претплата нуди најбољу цену. Квартална претплата је 25% скупља од годишње.
            Изаберите годишњу претплату и уштедите до 25%!
          </p>
        </div>

        {/* Link to full pricing page */}
        <div className="text-center mt-8">
          <Link to="/pricing" className="text-primary hover:underline">
            Погледајте детаљне цене и FAQ →
          </Link>
        </div>
      </div>
    </section>
  );
}
