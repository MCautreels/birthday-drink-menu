// Instellingen voor de drankkaart.
// Alle bestellingen worden als bericht verstuurd naar een ntfy.sh "topic".
// Iedereen die de topic-naam kent kan meelezen, dus kies iets dat moeilijk te raden is.
// Tip: installeer de gratis ntfy-app (iOS/Android) en abonneer je op deze topic
// om bij elke bestelling een melding op je telefoon te krijgen.
window.CONFIG = {
  ntfyServer: 'https://ntfy.sh',
  topic: 'mila8-vik4-drankjes-9351bbf3',
  // Zet op true om bestellen weer aan te zetten.
  ordersOpen: false,
  closedMessage: 'Sorry, het feestje is afgelopen. Tot volgend jaar!',
};

// Om te testen zonder de echte bestellingen te vervuilen: voeg ?topic=iets-anders toe aan de URL.
(function () {
  const t = new URLSearchParams(location.search).get('topic');
  if (t && /^[\w-]{4,64}$/.test(t)) CONFIG.topic = t;
})();
