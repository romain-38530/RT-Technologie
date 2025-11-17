const templates = {
  'dispatch_assign': {
    fr: {
      subject: 'Nouvelle mission à accepter — {{orderId}}',
      text: 'Bonjour {{carrierName}},\n\nUne mission vous est proposée pour la commande {{orderId}}. Délai d\'acceptation: {{slaHours}}h.\n\nMerci de confirmer ou refuser.'
    },
    en: {
      subject: 'New job to accept — {{orderId}}',
      text: 'Hello {{carrierName}},\n\nA job has been assigned to you for order {{orderId}}. Acceptance window: {{slaHours}}h.\n\nPlease accept or decline.'
    }
  },
  'dispatch_reminder': {
    fr: { subject: 'Rappel — {{minutes}} min restantes ({{orderId}})', text: 'Il reste {{minutes}} minutes pour accepter la commande {{orderId}}.' },
    en: { subject: 'Reminder — {{minutes}} min left ({{orderId}})', text: '{{minutes}} minutes left to accept order {{orderId}}.' }
  },
  'dispatch_accepted': {
    fr: { subject: 'Commande acceptée — {{orderId}}', text: 'Le transporteur {{carrierName}} a accepté la commande {{orderId}}.' },
    en: { subject: 'Order accepted — {{orderId}}', text: 'Carrier {{carrierName}} accepted order {{orderId}}.' }
  },
  'rdv_proposed': {
    fr: { subject: 'Proposition de RDV — {{orderId}}', text: 'Proposition pour {{orderId}} ({{leg}}) à {{proposedAt}}.' },
    en: { subject: 'Appointment proposed — {{orderId}}', text: 'Proposal for {{orderId}} ({{leg}}) at {{proposedAt}}.' }
  },
  'rdv_confirmed': {
    fr: { subject: 'RDV confirmé — {{orderId}}', text: 'RDV confirmé pour {{orderId}} ({{leg}}) — Dock {{dockId}} — {{start}} → {{end}}.' },
    en: { subject: 'Appointment confirmed — {{orderId}}', text: 'Confirmed for {{orderId}} ({{leg}}) — Dock {{dockId}} — {{start}} → {{end}}.' }
  }
};

function renderString(tpl, vars) {
  return tpl.replace(/\{\{(.*?)\}\}/g, (_, k) => (vars?.[k.trim()] ?? ''));
}

function compose(templateId, locale, vars) {
  const t = templates[templateId];
  if (!t) throw new Error(`Unknown template: ${templateId}`);
  const l = (locale && t[locale.toLowerCase()]) ? locale.toLowerCase() : (t['en'] ? 'en' : Object.keys(t)[0]);
  const subject = renderString(t[l].subject, vars);
  const text = renderString(t[l].text, vars);
  return { subject, text, locale: l };
}

module.exports = { compose };
