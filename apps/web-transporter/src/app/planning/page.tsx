'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { getSlots, RDVSlot } from '@/services/api';
import { getCurrentCarrier } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PlanningPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<RDVSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const carrier = getCurrentCarrier();

  useEffect(() => {
    if (!carrier) {
      router.push('/login');
      return;
    }
    loadSlots(currentDate);
  }, [carrier, currentDate, router]);

  const loadSlots = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = await getSlots(dateStr);
      setSlots(data.slots || []);
    } catch (err) {
      console.error('Error loading slots:', err);
      // Generate dummy slots for demo
      setSlots(generateDummySlots(date));
    } finally {
      setLoading(false);
    }
  };

  const generateDummySlots = (date: Date): RDVSlot[] => {
    const slots: RDVSlot[] = [];
    const times = ['08:00', '10:00', '12:00', '14:00', '16:00'];
    for (let i = 0; i < 7; i++) {
      const slotDate = addDays(date, i);
      const dateStr = format(slotDate, 'yyyy-MM-dd');
      times.forEach((time) => {
        slots.push({
          date: dateStr,
          time,
          available: Math.random() > 0.3,
        });
      });
    }
    return slots;
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
            <p className="mt-1 text-sm text-gray-500">
              Visualisez vos créneaux RDV confirmés
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Aujourd'hui
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
            >
              Suivant
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        )}

        {!loading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Semaine du {format(weekDays[0], 'dd MMMM yyyy', { locale: fr })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-200 bg-gray-50 p-2 text-left text-sm font-medium">
                        Heure
                      </th>
                      {weekDays.map((day) => (
                        <th
                          key={day.toISOString()}
                          className="border border-gray-200 bg-gray-50 p-2 text-center text-sm font-medium"
                        >
                          <div>{format(day, 'EEE', { locale: fr })}</div>
                          <div className="text-gray-500">{format(day, 'dd/MM')}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['08:00', '10:00', '12:00', '14:00', '16:00'].map((time) => (
                      <tr key={time}>
                        <td className="border border-gray-200 p-2 font-medium text-sm">
                          {time}
                        </td>
                        {weekDays.map((day) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const slot = slots.find(
                            (s) => s.date === dateStr && s.time === time
                          );
                          return (
                            <td
                              key={`${dateStr}-${time}`}
                              className={`border border-gray-200 p-2 text-center ${
                                slot?.available
                                  ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {slot?.available && (
                                <div className="text-xs text-green-700 font-medium">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  Disponible
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
                  <span className="text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2"></div>
                  <span className="text-gray-600">Occupé</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
