/* PostHog analytics for melissaphotographyparis.fr
   - Before the visitor answers the cookie banner: anonymous page views only, kept in memory
     (nothing stored on the device, no cookie).
   - After "Accept" (analytics): normal persistence and session replay (all form fields masked).
   - After "Refuse": PostHog stays in memory-only mode, no replay.
   The project key is public by design (it can only send events, not read them). */
(function () {
  var KEY = 'phc_rfWhxqEM3ichucdoS4WBCa8ZNcSk2UC5mxkERqrdZHWz';
  var HOST = 'https://eu.i.posthog.com';
  if (!KEY) return;

  // official PostHog loader
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: 'identified_only',
    persistence: 'memory',
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: true,
    session_recording: { maskAllInputs: true }
  });
  try { posthog.register({ site_language: document.documentElement.lang || 'en' }); } catch (e) { /* ignore */ }

  // called by js/cookieconsent-config.js whenever the visitor answers the banner
  window.mpAnalytics = {
    consent: function (analytics) {
      if (analytics) {
        posthog.set_config({ persistence: 'localStorage+cookie', disable_session_recording: false });
        posthog.startSessionRecording();
      } else {
        posthog.stopSessionRecording();
        posthog.set_config({ persistence: 'memory', disable_session_recording: true });
      }
    },
    track: function (event, props) {
      try { posthog.capture(event, props || {}); } catch (e) { /* ignore */ }
    }
  };
})();
