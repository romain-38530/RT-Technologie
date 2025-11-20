'use client';

import { Mission } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/button';
import { getTimeRemaining, getSLAStatus } from '@/lib/utils';
import { Clock, MapPin, Package } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MissionCardProps {
  mission: Mission;
  onAccept?: (id: string) => void;
  onRefuse?: (id: string) => void;
  showActions?: boolean;
}

export function MissionCard({ mission, onAccept, onRefuse, showActions = false }: MissionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [slaStatus, setSlaStatus] = useState<'critical' | 'warning' | 'normal'>('normal');

  useEffect(() => {
    if (!mission.expiresAt) return;

    const updateTimer = () => {
      setTimeRemaining(getTimeRemaining(mission.expiresAt!));
      setSlaStatus(getSLAStatus(mission.expiresAt!));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [mission.expiresAt]);

  const getBadgeVariant = () => {
    if (!mission.expiresAt) return 'default';
    switch (slaStatus) {
      case 'critical':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{mission.ref}</CardTitle>
            <CardDescription className="mt-1">Mission #{mission.id}</CardDescription>
          </div>
          {mission.expiresAt && (
            <Badge variant={getBadgeVariant()}>
              <Clock className="w-3 h-3 mr-1" />
              {timeRemaining}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mission.ship_from && (
          <div className="flex items-start space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-700">Départ</div>
              <div className="text-gray-600">{mission.ship_from}</div>
            </div>
          </div>
        )}
        {mission.ship_to && (
          <div className="flex items-start space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-700">Arrivée</div>
              <div className="text-gray-600">{mission.ship_to}</div>
            </div>
          </div>
        )}
        {(mission.pallets || mission.weight) && (
          <div className="flex items-center space-x-2 text-sm">
            <Package className="w-4 h-4 text-gray-500" />
            <div className="text-gray-600">
              {mission.pallets && `${mission.pallets} palettes`}
              {mission.pallets && mission.weight && ' • '}
              {mission.weight && `${mission.weight} kg`}
            </div>
          </div>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="space-x-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onAccept?.(mission.id)}
          >
            Accepter
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onRefuse?.(mission.id)}
          >
            Refuser
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
