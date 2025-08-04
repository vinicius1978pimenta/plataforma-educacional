import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TranslationService {
  constructor(private http: HttpService) {}

  async translate(text: string, targetLang: string = 'en'): Promise<string> {
    const url = 'https://api.mymemory.translated.net/get';

    try {
      const params = {
        q: text,
        langpair: `pt|${targetLang}`,
      };

      const response = await firstValueFrom(
        this.http.get(url, {
          params,
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
          timeout: 10000,
        }),
      );

      let traducao = response.data?.responseData?.translatedText;

      if (!traducao) {
        throw new Error('Campo translatedText não encontrado na resposta da API');
      }

      if (typeof traducao !== 'string') {
        throw new Error('translatedText retornado não é uma string válida');
      }

      let traducaoLimpa = traducao.trim();

      if (traducaoLimpa.toLowerCase() === text.toLowerCase().trim()) {
        const matches = response.data?.matches || [];

        let melhorTraducao: string | null = null;
        let melhorScore = 0;

        for (const match of matches) {
          const matchTranslation = match.translation?.trim();
          const quality = parseFloat(match.quality) || 0;
          const matchValue = parseFloat(match.match) || 0;

          if (
            matchTranslation &&
            matchTranslation.toLowerCase() !== text.toLowerCase().trim() &&
            quality >= 70 &&
            matchValue >= 0.95 &&
            matchTranslation.length <= text.length * 3 &&
            !matchTranslation.includes('Coordinating') &&
            !matchTranslation.includes('Mechanism') &&
            matchTranslation.split(' ').length <= 2
          ) {
            const score = quality * matchValue;

            if (score > melhorScore) {
              melhorScore = score;
              melhorTraducao = matchTranslation;
            }
          }
        }

        if (melhorTraducao) {
          traducaoLimpa = melhorTraducao;
        }
      }

      return traducaoLimpa;
    } catch {
      return await this.translateWithLibreTranslate(text, targetLang);
    }
  }

  private async translateWithLibreTranslate(text: string, targetLang: string): Promise<string> {
    const url = 'https://libretranslate.de/translate';

    try {
      const response = await firstValueFrom(
        this.http.post(
          url,
          {
            q: text,
            source: 'pt',
            target: targetLang,
            format: 'text',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0',
            },
            timeout: 10000,
          },
        ),
      );

      const traducao = response.data?.translatedText;

      if (!traducao || typeof traducao !== 'string') {
        throw new Error('LibreTranslate também falhou');
      }

      return traducao.trim();
    } catch {
      throw new Error('Ambas APIs de tradução falharam: MyMemory e LibreTranslate');
    }
  }
}
