// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // customCss: 'https://tcmacore.prod.azw2k8-public.impartner.io/static/showcase/{prjname}/css/custom.css',
  // customJS: 'https://tcmacore.prod.azw2k8-public.impartner.io/static/showcase/{prjname}/js/custom.js',
  prjFolder: 'https://tcmacore.prod.azw2k8-public.impartner.io/static/showcase/{prjname}',
  cspHost:'https://global.syndication.tiekinetix.net',
  baseApiUrl: 'https://tcmacore.prod.azw2k8-public.impartner.io/api/v1',
  gdprLocalizeUrl: 'https://tcmacore.prod.azw2k8-public.impartner.io/static/showcase/assets/shareddata/gdpr-localize.json',
  jsonLanguages: 'https://tcmacore.prod.azw2k8-public.impartner.io/static/showcase/assets/shareddata/csplanguage.json',
  libWebTrends: 'https://tcmacore.prod.azw2k8-public.impartner.io/static/showcase/shared/js/webtrends.js',
  wtTrackingUrl: 'localhost:4567/tracking',
  libCspReport: 'https://tcmacore.prod.azw2k8-public.impartner.io/static/showcase/shared/js/CspReportLib.js',
  // fileFieldSort: 'https://tcmacore.prod.azw2k8-public.impartner.io/static/showcasebuilder/assets/jsons/{prjname}/form-field-order.json',
  // assetJson: 'https://tcmacore.prod.azw2k8-public.impartner.io/static/showcasebuilder/assets/jsons/{prjname}'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
