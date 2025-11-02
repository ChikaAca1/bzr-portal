/**
 * Public Profile Page
 *
 * Displays a user's public business profile.
 * Accessible at /@username or /profile/:username
 * Shows user info, bio, companies, and contact info.
 */

import { useParams, Link } from 'react-router-dom';
import { trpc } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function PublicProfile() {
  const { username } = useParams<{ username: string }>();

  const { data: profile, isLoading, error } = trpc.profile.getByUsername.useQuery(
    { username: username || '' },
    { enabled: !!username }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Учитавање профила...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Профил није пронађен</CardTitle>
            <CardDescription>
              Корисник са корисничким именом "@{username}" не постоји или је профил приватан.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button variant="outline" className="w-full">
                Назад на почетну
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, companies, stats } = profile;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">
            БЗР Портал
          </Link>
          <div className="space-x-2">
            <Link to="/login">
              <Button variant="ghost">Пријави се</Button>
            </Link>
            <Link to="/register">
              <Button>Региструј се</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              {/* Logo/Avatar */}
              <div className="flex-shrink-0">
                {user.logoUrl ? (
                  <img
                    src={user.logoUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-muted-foreground mb-1">@{user.username}</p>

                {user.bio && (
                  <p className="text-gray-700 mt-4 leading-relaxed">{user.bio}</p>
                )}

                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">{stats.companiesCount}</span> предузећа
                  </div>
                  <div>
                    Члан од {new Date(stats.memberSince).toLocaleDateString('sr-RS', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </div>
                </div>

                {user.website && (
                  <div className="mt-4">
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-2"
                    >
                      🌐 {user.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies Section */}
        {companies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Предузећа</CardTitle>
              <CardDescription>
                {stats.companiesCount} {stats.companiesCount === 1 ? 'предузеће' : 'предузећа'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Шифра делатности: {company.activityCode}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Регистровано {new Date(company.createdAt).toLocaleDateString('sr-RS')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold mb-2">
              Желите свој БЗР Портал профил?
            </h3>
            <p className="text-muted-foreground mb-4">
              Региструјте се бесплатно и добијте своју јавну страницу као {user.firstName}!
            </p>
            <Link to="/register">
              <Button size="lg" className="font-semibold">
                Креирај бесплатан налог
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} БЗР Портал. Сва права задржана.</p>
        </div>
      </footer>
    </div>
  );
}
