'use client';

import { useState, useEffect } from 'react';
import { palettesApi, type PalletSite } from '@/lib/api/palettes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Clock, Calendar, Package, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<PalletSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const data = await palettesApi.getSites();
        setSites(data);
      } catch (error) {
        console.error('Error fetching sites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      INTERNAL: 'bg-blue-100 text-blue-800',
      NETWORK: 'bg-green-100 text-green-800',
      EXTERNAL: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[priority] || 'bg-gray-100'}>
        {priority}
      </Badge>
    );
  };

  const getDayNames = (days: number[]) => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days.map(d => dayNames[d]).join(', ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Chargement des sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Sites de retour</h1>
        <p className="text-gray-600 mt-1">
          Liste des sites disponibles pour le retour de palettes
        </p>
      </div>

      {sites.length === 0 ? (
        <Card>
          <div className="p-6 text-center text-gray-600">
            Aucun site de retour disponible
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => {
            const quotaPercent = (site.quotaConsumed / site.quotaDailyMax) * 100;
            const isNearCapacity = quotaPercent > 80;
            const quotaAvailable = site.quotaDailyMax - site.quotaConsumed;

            return (
              <Card key={site.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{site.name}</h2>
                        {getPriorityBadge(site.priority)}
                      </div>
                      <div className="flex items-start text-gray-600">
                        <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{site.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* GPS Coordinates */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Coordonnées GPS</p>
                    <p className="font-mono text-sm text-gray-900">
                      {site.gps.lat.toFixed(4)}, {site.gps.lng.toFixed(4)}
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Horaires</p>
                        <p className="text-sm font-medium text-gray-900">
                          {site.openingHours.start} - {site.openingHours.end}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Jours ouverts</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getDayNames(site.availableDays)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quota */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Capacité journalière
                        </span>
                      </div>
                      <span className={`font-bold ${isNearCapacity ? 'text-orange-600' : 'text-green-600'}`}>
                        {quotaAvailable} / {site.quotaDailyMax}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isNearCapacity ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {isNearCapacity
                        ? '⚠️ Capacité bientôt atteinte'
                        : '✓ Capacité disponible'}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={() => {
                        // Open Google Maps with coordinates
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${site.gps.lat},${site.gps.lng}`,
                          '_blank'
                        );
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Ouvrir dans Google Maps
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
