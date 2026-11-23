import type { Lang } from './lang';

// Long-form legal copy, kept apart from ui.ts. {email}/{form} are replaced by the page.
export const HOST = 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA — vercel.com';

export const legal = {
  en: {
    legalTitle: 'Legal notice',
    publisher: 'Publisher',
    publisherFallback: 'Labs Startup Nation, Paris (student group).',
    director: 'Publication director',
    host: 'Hosting',
    contact: 'Contact',
    contactForm: 'Use the proposal form',
    content: 'Content',
    contentText: 'The Tech Watch summarises public sources and links to each of them. Trademarks and logos quoted belong to their owners.',
    privacyTitle: 'Privacy policy',
    privacyIntro: 'This page explains what happens to the information you send us through the project proposal form. It is the only personal data this site collects.',
    sections: [
      ['What we collect', 'Your name, your email address, your organisation if you give it, the description of your project, when you would like to test it, and the date you sent it.'],
      ['Why', 'Only to read your proposal and answer you. We do not use it for marketing, we do not sell it and we do not share it outside the LSN team. The legal basis is your consent, given with the checkbox on the form.'],
      ['How long', 'We keep a proposal for 12 months after our last exchange with you, then delete it.'],
      ['Who can see it', 'Only the LSN members who handle proposals, through the Supabase dashboard. Supabase stores the data for us as a processor.'],
      ['How to have it deleted', 'You can ask to see, correct or delete your proposal at any time: {contact}. We answer within one month. You can also complain to the CNIL (cnil.fr).'],
      ['Where it is stored', 'In a Supabase database hosted in the European Union. The site itself is served by Vercel, which keeps technical logs (such as IP addresses) for security for a short time.'],
      ['Cookies', 'This site uses no cookies and no tracking. Visits are counted without cookies and without identifying you.'],
    ],
    contactEmail: 'email {email}',
    contactNoEmail: 'send a message through {form}, saying it is about your data',
    formLink: 'the proposal form',
  },
  fr: {
    legalTitle: 'Mentions légales',
    publisher: 'Éditeur',
    publisherFallback: 'Labs Startup Nation, Paris (groupe d’étudiants).',
    director: 'Directeur de la publication',
    host: 'Hébergement',
    contact: 'Contact',
    contactForm: 'Utilisez le formulaire de proposition',
    content: 'Contenu',
    contentText: 'La veille tech résume des sources publiques et renvoie à chacune d’elles. Les marques et logos cités appartiennent à leurs propriétaires.',
    privacyTitle: 'Politique de confidentialité',
    privacyIntro: 'Cette page explique ce que deviennent les informations que vous nous envoyez avec le formulaire de proposition de projet. Ce sont les seules données personnelles que ce site collecte.',
    sections: [
      ['Ce que nous collectons', 'Votre nom, votre adresse e-mail, votre organisation si vous l’indiquez, la description de votre projet, quand vous aimeriez le tester, et la date d’envoi.'],
      ['Pourquoi', 'Uniquement pour lire votre proposition et vous répondre. Nous ne l’utilisons pas pour de la prospection, ne la vendons pas et ne la partageons pas en dehors de l’équipe LSN. La base légale est votre consentement, donné avec la case à cocher du formulaire.'],
      ['Combien de temps', 'Nous conservons une proposition 12 mois après notre dernier échange avec vous, puis nous la supprimons.'],
      ['Qui y a accès', 'Seuls les membres de LSN qui traitent les propositions, depuis le tableau de bord Supabase. Supabase stocke les données pour notre compte, en tant que sous-traitant.'],
      ['Comment la faire supprimer', 'Vous pouvez demander à consulter, corriger ou supprimer votre proposition à tout moment : {contact}. Nous répondons sous un mois. Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).'],
      ['Où elle est stockée', 'Dans une base Supabase hébergée dans l’Union européenne. Le site lui-même est servi par Vercel, qui conserve brièvement des journaux techniques (comme les adresses IP) pour la sécurité.'],
      ['Cookies', 'Ce site n’utilise aucun cookie ni aucun traceur. Les visites sont comptées sans cookie et sans vous identifier.'],
    ],
    contactEmail: 'écrivez à {email}',
    contactNoEmail: 'envoyez un message avec {form}, en précisant qu’il concerne vos données',
    formLink: 'le formulaire de proposition',
  },
} satisfies Record<Lang, unknown>;
