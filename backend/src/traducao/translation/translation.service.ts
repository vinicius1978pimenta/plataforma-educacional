import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TranslationService {
  constructor(private http: HttpService) {}

  async translate(text: string, targetLang: string = 'en'): Promise<string> {
    // Usando MyMemory API 
    const url = 'https://api.mymemory.translated.net/get';

    try {
      console.log('🔄 Iniciando tradução com MyMemory:', { 
        texto: text, 
        de: 'pt', 
        para: targetLang 
      });

      const params = {
        q: text,
        langpair: `pt|${targetLang}`, 
      };

      console.log('📤 Parâmetros enviados:', params);

      const response = await firstValueFrom(
        this.http.get(url, {
          params,
          headers: { 
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 10000, // 10 segundos
        }),
      );

      console.log('📥 Status da resposta:', response.status);
      console.log('📥 Resposta completa da API:', JSON.stringify(response.data, null, 2));

      // MyMemory retorna a tradução em responseData.translatedText
      let traducao = response.data?.responseData?.translatedText;
      
      if (!traducao) {
        console.error('❌ Campo translatedText não encontrado na resposta');
        throw new Error('Campo translatedText não encontrado na resposta da API');
      }

      if (typeof traducao !== 'string') {
        console.error('❌ translatedText não é string:', typeof traducao, traducao);
        throw new Error('translatedText retornado não é uma string válida');
      }

      let traducaoLimpa = traducao.trim();
      
      // Se a tradução principal é igual ao original, buscar nos matches
      if (traducaoLimpa.toLowerCase() === text.toLowerCase().trim()) {
        console.log('🔍 Tradução principal igual ao original, buscando nos matches...');
        
        const matches = response.data?.matches || [];
        console.log(`📋 Encontrados ${matches.length} matches`);

        // Buscar a melhor tradução alternativa nos matches
        let melhorTraducao = null;
        let melhorScore = 0;

        for (const match of matches) {
          const matchTranslation = match.translation?.trim();
          const quality = parseFloat(match.quality) || 0;
          const matchValue = parseFloat(match.match) || 0;
          
          console.log(`🎯 Analisando match: "${matchTranslation}" (quality: ${quality}, match: ${matchValue})`);
          
          // Filtros para uma boa tradução:
          if (matchTranslation && 
              matchTranslation.toLowerCase() !== text.toLowerCase().trim() && 
              quality >= 70 && // Qualidade razoável
              matchValue >= 0.95 && // Match muito próximo
              matchTranslation.length <= text.length * 3 && 
              !matchTranslation.includes('Coordinating') && 
              !matchTranslation.includes('Mechanism') &&
              matchTranslation.split(' ').length <= 2) { 
            
            // Score baseado em qualidade e match
            const score = quality * matchValue;
            
            if (score > melhorScore) {
              melhorScore = score;
              melhorTraducao = matchTranslation;
              console.log(`🌟 Novo melhor candidato: "${matchTranslation}" (score: ${score})`);
            }
          }
        }

        if (melhorTraducao) {
          traducaoLimpa = melhorTraducao;
          console.log(`✨ Usando melhor match: "${melhorTraducao}" (score: ${melhorScore})`);
        } else {
          console.log('⚠️ Nenhum match adequado encontrado, mantendo original');
        }
      }

      console.log('✅ Tradução final:', {
        original: text,
        traduzido: traducaoLimpa,
        mudou: traducaoLimpa.toLowerCase() !== text.toLowerCase().trim()
      });

      return traducaoLimpa;

    } catch (error) {
      console.error('💥 Erro na tradução com MyMemory:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });

      // Fallback: tentar LibreTranslate como backup
      return await this.translateWithLibreTranslate(text, targetLang);
    }
  }

  // Método backup com LibreTranslate
  private async translateWithLibreTranslate(text: string, targetLang: string): Promise<string> {
    const url = 'https://libretranslate.de/translate';

    try {
      console.log('🔄 Tentando LibreTranslate como backup...');

      const response = await firstValueFrom(
        this.http.post(url, {
          q: text,
          source: 'pt',
          target: targetLang,
          format: 'text',
        }, {
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 10000,
        }),
      );

      const traducao = response.data?.translatedText;

      if (!traducao || typeof traducao !== 'string') {
        throw new Error('LibreTranslate também falhou');
      }

      console.log('✅ Backup LibreTranslate funcionou:', traducao.trim());
      return traducao.trim();

    } catch (error) {
      console.error('💥 Backup LibreTranslate também falhou:', error.message);
      
      // Se ambas as APIs falharam, throw error para usar fallback no service principal
      throw new Error(`Ambas APIs de tradução falharam: MyMemory e LibreTranslate`);
    }
  }
}