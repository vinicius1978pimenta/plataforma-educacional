import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from '../interceptor/auth.interceptor';

import { provideTransloco, TranslocoModule } from '@ngneat/transloco';
import { TranslocoHttpLoader } from './transloco/transloco-loader'; // ajuste o caminho conforme seu projeto

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    // 🔹 Configuração Transloco
    provideTransloco({
      config: {
        availableLangs: ['pt-BR','en', 'es'],    // Apenas idiomas que o usuário pode trocar
        defaultLang: 'pt-BR',            // Idioma inicial
        fallbackLang: 'pt-BR',           // Fallback para português
        reRenderOnLangChange: true,
        prodMode: false // Mudar para true em produção
      },
      loader: TranslocoHttpLoader
    }),
    importProvidersFrom(TranslocoModule)
  ]
};
