import * as React from 'react';
import { HelpCircle, GraduationCap, BookOpen, Award, Video } from 'lucide-react';
import { Button, Modal, ModalContent, ModalHeader, ModalTitle, Badge, Tooltip } from '@rt/design-system';
import { motion } from 'framer-motion';

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: number;
  progress?: number;
  completed?: boolean;
}

export interface HelpButtonProps {
  modules: TrainingModule[];
  userProgress?: Record<string, number>; // moduleId -> progress %
  certificates?: Array<{
    moduleId: string;
    moduleTitle: string;
    completedAt: Date;
    averageScore: number;
  }>;
  onStartModule?: (moduleId: string) => void;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  modules,
  userProgress = {},
  certificates = [],
  onStartModule,
  position = 'top-right',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'modules' | 'progress' | 'certificates' | 'videos'>('modules');

  // Calculer le nombre de modules non complétés
  const incompletedCount = modules.filter(
    (m) => !certificates.find((c) => c.moduleId === m.id)
  ).length;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const handleStartModule = (moduleId: string) => {
    setIsOpen(false);
    onStartModule?.(moduleId);
  };

  return (
    <>
      {/* Bouton d'aide flottant */}
      <Tooltip content="Centre de formation">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`fixed ${positionClasses[position]} z-50`}
        >
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <HelpCircle className="h-6 w-6" />
            {incompletedCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full"
              >
                {incompletedCount}
              </motion.span>
            )}
            {/* Animation pulse */}
            {incompletedCount > 0 && (
              <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-75" />
            )}
          </button>
        </motion.div>
      </Tooltip>

      {/* Modal de formation */}
      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <ModalContent size="xl" showCloseButton>
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              Centre de Formation RT
            </ModalTitle>
          </ModalHeader>

          <div className="mt-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('modules')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'modules'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="inline h-4 w-4 mr-2" />
                Modules
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'progress'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <GraduationCap className="inline h-4 w-4 mr-2" />
                Ma progression
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'certificates'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Award className="inline h-4 w-4 mr-2" />
                Certificats ({certificates.length})
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'videos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Video className="inline h-4 w-4 mr-2" />
                Vidéos
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[500px] overflow-y-auto">
              {/* Tab: Modules */}
              {activeTab === 'modules' && (
                <div className="space-y-4">
                  {modules.map((module) => {
                    const progress = userProgress[module.id] || 0;
                    const certificate = certificates.find((c) => c.moduleId === module.id);

                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{module.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {module.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {module.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  Durée : {module.duration} minutes
                                </p>
                              </div>
                              {certificate && (
                                <Badge variant="success">
                                  Complété
                                </Badge>
                              )}
                            </div>

                            {/* Progress bar */}
                            {progress > 0 && !certificate && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span>Progression</span>
                                  <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600 transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="mt-4">
                              <Button
                                onClick={() => handleStartModule(module.id)}
                                variant={certificate ? 'secondary' : 'primary'}
                                size="sm"
                                fullWidth
                              >
                                {certificate
                                  ? 'Revoir le module'
                                  : progress > 0
                                  ? 'Continuer'
                                  : 'Commencer'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Tab: Progression */}
              {activeTab === 'progress' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          Progression globale
                        </p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {Math.round(
                            (certificates.length / modules.length) * 100
                          )}
                          %
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {certificates.length} / {modules.length} modules
                        </p>
                      </div>
                    </div>
                  </div>

                  {modules.map((module) => {
                    const progress = userProgress[module.id] || 0;
                    const certificate = certificates.find((c) => c.moduleId === module.id);

                    return (
                      <div
                        key={module.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {module.icon} {module.title}
                          </h4>
                          {certificate && (
                            <Badge variant="success" size="sm">
                              Score : {certificate.averageScore}%
                            </Badge>
                          )}
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              certificate ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{
                              width: `${certificate ? 100 : progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab: Certificats */}
              {activeTab === 'certificates' && (
                <div className="space-y-4">
                  {certificates.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Aucun certificat obtenu pour le moment
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Complétez un module pour obtenir votre premier certificat
                      </p>
                    </div>
                  ) : (
                    certificates.map((cert) => (
                      <motion.div
                        key={cert.moduleId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6"
                      >
                        <div className="flex items-start gap-4">
                          <Award className="h-12 w-12 text-yellow-600" />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {cert.moduleTitle}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Complété le{' '}
                              {new Date(cert.completedAt).toLocaleDateString('fr-FR')}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <Badge variant="warning">
                                Score : {cert.averageScore}%
                              </Badge>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" size="sm">
                                Télécharger PDF
                              </Button>
                              <Button variant="ghost" size="sm">
                                Partager
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Vidéos */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Bibliothèque de tutoriels vidéo
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {['Démarrage rapide', 'Astuces avancées', 'Cas d\'usage', 'FAQ vidéo'].map(
                      (video, i) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="aspect-video bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {video}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">5 min</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HelpButton;
