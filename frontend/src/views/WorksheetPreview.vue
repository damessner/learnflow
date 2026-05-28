<template>
  <div class="page">
    <h2 v-if="worksheet">{{ worksheet.title }} (Preview)</h2>
    <p v-if="worksheet" style="color: var(--text-muted)">{{ worksheet.description }}</p>

    <div v-if="worksheet" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; align-items: center; flex-wrap: wrap">
      <button v-if="isTeacher" class="btn-primary btn-lg" style="display: flex; align-items: center; gap: 0.25rem" @click="cloneWorksheet">
        <span>📥</span> Clone to my Worksheets
      </button>
      <button class="btn btn-lg" @click="goBack">Go Back</button>
      <button
        class="btn btn-lg"
        :style="{ background: showAnswers ? 'var(--warning)' : 'var(--bg-card)', color: showAnswers ? '#000' : 'var(--text-main)' }"
        @click="showAnswers = !showAnswers"
      >
        {{ showAnswers ? '🔍 Hide Answers' : '🔍 Show Answers' }}
      </button>
      <button
        v-if="!showAnswers"
        class="btn btn-lg"
        :style="{ background: checked ? 'var(--success)' : 'var(--bg-card)', color: checked ? '#fff' : 'var(--text-main)' }"
        @click="checkAnswers"
      >
        {{ checked ? `✅ ${score}/${totalPoints}` : '✅ Check Answers' }}
      </button>
      <span v-if="worksheet.subject" class="badge" style="background: rgba(79, 70, 229, 0.1); color: var(--primary); padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600">
        {{ worksheet.subject }}
      </span>
      <span v-if="worksheet.grade_level" class="badge" style="background: rgba(107, 114, 128, 0.1); color: var(--text-main); padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600">
        {{ formatGrade(worksheet.grade_level) }}
      </span>
    </div>

    <div v-for="(block, bIdx) in blocks" :key="block.id" class="card" style="margin-bottom: 0.5rem">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem">
        <strong>{{ block.type.replace(/_/g, ' ') }}</strong>
        <span class="badge">{{ block.points }} pts</span>
        <span v-if="checked && blockResults[bIdx] !== undefined" :style="{ color: blockResults[bIdx] ? 'var(--success)' : 'var(--danger)', fontWeight: 600, fontSize: '0.85rem' }">
          {{ blockResults[bIdx] ? '✓ Correct' : '✗ Missed' }}
        </span>
      </div>

      <template v-if="block.type === 'gap_fill'">
        <div>
          <template v-for="seg in getGapPreviewSegments(block.template)" :key="seg.key">
            <span v-if="seg.type === 'text'" style="white-space: pre-wrap">{{ seg.text }}</span>
            <span v-else-if="seg.type === 'gap'">
              <input
                v-if="!showAnswers"
                v-model="answers[block.id][seg.key]"
                :placeholder="'...'"
                :style="{
                  display: 'inline',
                  width: Math.max(60, seg.answer.length * 14) + 'px',
                  padding: '0.15rem 0.35rem',
                  border: checked && answers[block.id][seg.key]?.toLowerCase().trim() === seg.answer.toLowerCase()
                    ? '2px solid var(--success)'
                    : checked
                      ? '2px solid var(--danger)'
                      : '1px dashed var(--primary)',
                  borderRadius: '4px',
                  background: checked && answers[block.id][seg.key]?.toLowerCase().trim() === seg.answer.toLowerCase()
                    ? 'rgba(34,197,94,0.08)'
                    : checked
                      ? 'rgba(239,68,68,0.08)'
                      : 'transparent',
                }"
              />
              <span v-else :style="{ color: 'var(--success)', fontWeight: 600 }">{{ seg.answer }}</span>
            </span>
          </template>
        </div>
      </template>

      <template v-if="block.type === 'multiple_choice'">
        <div v-for="(opt, oi) in block.options" :key="oi" style="padding: 0.25rem 0; display: flex; align-items: center; gap: 0.5rem">
          <input
            v-if="!showAnswers"
            type="checkbox"
            :checked="answers[block.id]?.includes(oi)"
            @change="toggleMcAnswer(block.id, Number(oi))"
            :disabled="checked"
          />
          <span v-if="showAnswers && block.correct && block.correct.includes(oi)" style="color: var(--success)">✓</span>
          <span v-if="showAnswers && block.correct && !block.correct.includes(oi)" style="color: var(--text-muted)">○</span>
          <span :style="{
            color: checked && answers[block.id]?.includes(oi)
              ? (block.correct?.includes(oi) ? 'var(--success)' : 'var(--danger)')
              : 'var(--text-main)',
            fontWeight: checked && block.correct?.includes(oi) ? 600 : 400,
          }">{{ opt }}</span>
        </div>
      </template>

      <template v-if="block.type === 'single_choice'">
        <div v-for="(opt, oi) in block.options" :key="oi" style="padding: 0.25rem 0; display: flex; align-items: center; gap: 0.5rem">
          <input
            v-if="!showAnswers"
            type="radio"
            :name="'sc_' + block.id"
            :checked="answers[block.id] === oi"
            @change="answers[block.id] = oi"
            :disabled="checked"
          />
          <span v-if="showAnswers && block.correct === oi" style="color: var(--success)">●</span>
          <span v-if="showAnswers && block.correct !== oi" style="color: var(--text-muted)">○</span>
          <span :style="{
            color: checked && answers[block.id] === oi
              ? (block.correct === oi ? 'var(--success)' : 'var(--danger)')
              : 'var(--text-main)',
            fontWeight: checked && block.correct === oi ? 600 : 400,
          }">{{ opt }}</span>
        </div>
      </template>

      <template v-if="block.type === 'matching'">
        <div v-for="(pair, pi) in block.pairs" :key="pi" style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem">
          <span style="min-width: 120px">{{ pair[0] }}</span>
          <span style="color: var(--text-muted)">→</span>
          <input
            v-if="!showAnswers"
            v-model="answers[block.id][pi]"
            :placeholder="'Match...'"
            :style="{
              flex: 1,
              border: checked && answers[block.id][pi]?.toLowerCase().trim() === pair[1].toLowerCase()
                ? '2px solid var(--success)'
                : checked ? '2px solid var(--danger)' : '1px solid var(--border-color)',
              borderRadius: '4px',
            }"
            :disabled="checked"
          />
          <span v-else style="color: var(--success)">{{ pair[1] }}</span>
        </div>
      </template>

      <template v-if="block.type === 'short_answer'">
        <div v-if="block.keywords" style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.25rem">
          Expected keywords: {{ (block.keywords || []).join(', ') }}
        </div>
        <div v-if="block.sample_answer" style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.25rem">
          Sample: {{ block.sample_answer }}
        </div>
        <textarea
          v-if="!showAnswers"
          v-model="answers[block.id]"
          rows="3"
          :placeholder="block.sample_answer ? 'Write your answer...' : 'Your answer...'"
          style="margin-top: 0.25rem; width: 100%"
          :disabled="checked"
        ></textarea>
        <div v-else style="color:var(--success);font-weight:600;margin-top:0.25rem">{{ block.sample_answer || '(Sample answer)' }}</div>
      </template>

      <template v-if="block.type === 'info_box'">
        <div style="background:var(--primary-light);border:1px solid var(--primary-soft);border-radius:var(--radius-md);padding:0.75rem 1rem">
          <div style="display:flex;align-items:center;gap:0.5rem;font-weight:600;color:var(--primary)">
            <span>💡</span>
            <span>{{ block.title || 'Click to learn more' }}</span>
          </div>
          <div style="margin-top:0.5rem;font-size:0.9rem;color:var(--text-main);white-space:pre-wrap">{{ block.text }}</div>
          <MermaidDiagram v-if="block.mermaid" :code="block.mermaid" :alt-text="block.alt_text" style="margin-top:0.5rem" />
        </div>
      </template>

      <template v-if="block.type === 'text'">
        <div style="white-space: pre-wrap">{{ block.text }}</div>
      </template>

      <!-- Media / Image Block -->
      <template v-if="block.type === 'media'">
        <div style="text-align: center; margin-top: 0.5rem">
          <img :src="block.src" style="max-width:100%; max-height:400px; border-radius:8px; border:1px solid var(--border-color)" />
          <p v-if="block.caption" style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem">{{ block.caption }}</p>
        </div>
      </template>

      <!-- Audio Block -->
      <template v-if="block.type === 'audio'">
        <div style="margin-top: 0.5rem">
          <audio :src="block.src" controls style="width:100%"></audio>
          <p v-if="block.caption" style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem">{{ block.caption }}</p>
        </div>
      </template>

      <!-- Video Block -->
      <template v-if="block.type === 'video'">
        <div style="text-align: center; margin-top: 0.5rem">
          <video :src="block.src" controls style="max-width:100%; max-height:400px; border-radius:8px"></video>
          <p v-if="block.caption" style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem">{{ block.caption }}</p>
        </div>
      </template>

      <!-- YouTube Block -->
      <template v-if="block.type === 'youtube'">
        <div style="text-align: center; margin-top: 0.5rem">
          <iframe
            v-if="youtubeEmbed(block.src)"
            width="560"
            height="315"
            :src="youtubeEmbed(block.src)"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            style="max-width:100%; border-radius:8px"
          ></iframe>
          <div v-else style="color:var(--text-muted)">Invalid YouTube Link</div>
          <p v-if="block.caption" style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem">{{ block.caption }}</p>
        </div>
      </template>

      <!-- Drawing Block -->
      <template v-if="block.type === 'drawing'">
        <div style="margin-top: 0.5rem">
          <div style="font-weight: 500; margin-bottom: 0.25rem">{{ block.text || 'Draw here:' }}</div>
          <ScratchpadCanvas />
        </div>
      </template>

      <template v-if="block.type === 'vocabulary'">
        <Vocabulary :block="block" :readonly="true" />
      </template>

      <template v-if="block.type === 'semantic_sorter'">
        <SemanticSorter :block="block" :readonly="true" />
      </template>

      <template v-if="block.type === 'flashcards'">
        <Flashcards :block="block" :readonly="true" />
      </template>

      <!-- True / False -->
      <template v-if="block.type === 'true_false'">
        <div style="margin-top:0.25rem;display:flex;gap:1rem;align-items:center">
          <span style="font-weight:500">{{ block.text }}</span>
          <span v-if="!showAnswers" style="display:flex;gap:0.5rem">
            <label style="display:flex;align-items:center;gap:0.25rem;cursor:pointer">
              <input type="radio" :name="'tf_' + block.id" value="true" v-model="answers[block.id]" :disabled="checked" /> True
            </label>
            <label style="display:flex;align-items:center;gap:0.25rem;cursor:pointer">
              <input type="radio" :name="'tf_' + block.id" value="false" v-model="answers[block.id]" :disabled="checked" /> False
            </label>
          </span>
          <span v-else style="font-weight:600;color:var(--success)">
            {{ block.correct_answer ? 'True' : 'False' }}
          </span>
          <span v-if="checked && answers[block.id] !== undefined" :style="{ color: (answers[block.id] === 'true') === block.correct_answer ? 'var(--success)' : 'var(--danger)', marginLeft: '0.5rem', fontWeight: 600 }">
            {{ (answers[block.id] === 'true') === block.correct_answer ? '✓' : '✗' }}
          </span>
        </div>
      </template>

      <!-- Ordering -->
      <template v-if="block.type === 'ordering'">
        <div v-if="!showAnswers" style="margin-top:0.25rem">
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.35rem">{{ block.text }}</p>
          <div
            v-for="(item, oi) in orderingItems(block)"
            :key="oi"
            style="display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0.5rem;margin-bottom:0.2rem;background:var(--bg-main);border-radius:4px;border:1px solid var(--border-color);cursor:grab"
          >
            <span style="color:var(--text-muted);font-size:0.8rem;min-width:24px">#{{ oi + 1 }}</span>
            <button class="btn-sm" style="padding:0.1rem 0.3rem;font-size:0.7rem" @click="moveOrderItem(block.id, oi, -1)" :disabled="oi === 0">▲</button>
            <button class="btn-sm" style="padding:0.1rem 0.3rem;font-size:0.7rem" @click="moveOrderItem(block.id, oi, 1)" :disabled="oi === orderingItems(block).length - 1">▼</button>
            <span>{{ item }}</span>
          </div>
        </div>
        <div v-else style="margin-top:0.25rem">
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.35rem">{{ block.text }}</p>
          <div v-for="(item, oi) in block.items" :key="oi" style="padding:0.25rem 0">
            <strong>{{ Number(oi) + 1 }}.</strong> {{ item }}
          </div>
        </div>
      </template>

      <!-- Drag Words -->
      <template v-if="block.type === 'drag_words'">
        <div>
          <template v-for="seg in getGapPreviewSegments(block.template)" :key="seg.key">
            <span v-if="seg.type === 'text'" style="white-space: pre-wrap">{{ seg.text }}</span>
            <span v-else-if="seg.type === 'gap'">
              <input
                v-if="!showAnswers"
                v-model="answers[block.id][seg.key]"
                :placeholder="'...'"
                :style="{
                  display: 'inline',
                  width: Math.max(60, seg.answer.length * 14) + 'px',
                  padding: '0.15rem 0.35rem',
                  border: checked && answers[block.id][seg.key]?.toLowerCase().trim() === seg.answer.toLowerCase()
                    ? '2px solid var(--success)' : checked ? '2px solid var(--danger)' : '1px dashed var(--primary)',
                  borderRadius: '4px',
                  background: checked && answers[block.id][seg.key]?.toLowerCase().trim() === seg.answer.toLowerCase()
                    ? 'rgba(34,197,94,0.08)' : checked ? 'rgba(239,68,68,0.08)' : 'transparent',
                }"
              />
              <span v-else :style="{ color: 'var(--success)', fontWeight: 600 }">{{ seg.answer }}</span>
            </span>
          </template>
        </div>
      </template>

      <!-- Correct Words -->
      <template v-if="block.type === 'correct_words'">
        <div>
          <template v-for="(seg, si) in getCorrectWordsSegments(block.template)" :key="si">
            <span v-if="seg.type === 'text'">{{ seg.text }}</span>
            <span v-else-if="seg.type === 'word'">
              <span v-if="!showAnswers">
                <input
                  v-model="answers[block.id][String(seg.index)]"
                  :placeholder="'correct/wrong'"
                  :style="{
                    width: '100px',
                    padding: '0.1rem 0.25rem',
                    border: checked
                      ? (answers[block.id][String(seg.index)]?.toLowerCase().trim() === seg.correct.toLowerCase()
                        ? '2px solid var(--success)' : '2px solid var(--danger)')
                      : '1px dashed var(--primary)',
                    borderRadius: '4px',
                  }"
                />
              </span>
              <span v-else :style="{ color: 'var(--success)', fontWeight: 600 }">{{ seg.correct }}</span>
              <span v-if="showAnswers" style="color:var(--text-muted);font-size:0.75rem"> (was {{ seg.wrong }})</span>
            </span>
          </template>
        </div>
      </template>

      <!-- Correct Words -->
      <template v-if="block.type === 'correct_words'">
        <div>
          <template v-for="(seg, si) in getCorrectWordsSegments(block.template)" :key="si">
            <span v-if="seg.type === 'text'">{{ seg.text }}</span>
            <span v-else-if="seg.type === 'word'" style="color:var(--text-muted)">
              <del style="color:red">{{ seg.wrong }}</del> (<ins style="color:green;text-decoration:none">{{ seg.correct }}</ins>)
            </span>
          </template>
        </div>
      </template>

      <!-- Question Table -->
      <template v-if="block.type === 'question_table'">
        <table style="width:100%;border-collapse:collapse;margin-top:0.25rem;border:1px solid var(--border-color)">
          <thead>
            <tr style="border-bottom:1px solid var(--border-color);background:var(--bg-main)">
              <th style="text-align:left;padding:0.25rem 0.5rem">Statement</th>
              <th v-for="col in block.columns" :key="col" style="text-align:center;padding:0.25rem 0.5rem;width:80px">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in block.rows || []" :key="ri" style="border-bottom:1px solid var(--border-color)">
              <td style="padding:0.25rem 0.5rem">{{ row.split('##')[0] }}</td>
              <td v-for="(col, ci) in block.columns" :key="ci" style="text-align:center;padding:0.25rem 0.5rem">
                <input
                  v-if="!showAnswers"
                  type="radio"
                  :name="'qt_' + block.id + '_' + ri"
                  :value="col"
                  v-model="answers[block.id][ri]"
                  :disabled="checked"
                />
                <span v-else-if="row.split('##')[1] === col" style="color:var(--success);font-weight:700">✓</span>
                <span v-else style="color:var(--text-muted)">○</span>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <!-- Crossword -->
      <template v-if="block.type === 'crossword'">
        <div v-if="block.words?.length" style="display:flex;gap:1.5rem;flex-wrap:wrap">
          <div>
            <div v-for="(item, idx) in block.words" :key="idx" style="margin-bottom:0.35rem;font-size:0.85rem">
              <strong>{{ Number(idx) + 1 }}.</strong>
              <span style="font-family:monospace;background:var(--bg-main);padding:0.1rem 0.25rem;border-radius:3px;margin:0 0.25rem">{{ item.word }}</span>
              {{ item.description }}
            </div>
          </div>
          <div style="display:flex;gap:0.2rem;flex-wrap:wrap;align-items:center">
            <span style="font-size:0.75rem;color:var(--text-muted)">Preview:</span>
            <div v-for="(item, idx) in block.words" :key="'box-'+idx" style="display:flex;gap:1px">
              <div
                v-for="(ch, ci) in item.word"
                :key="ci"
                style="width:24px;height:24px;border:1px solid var(--border-color);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;font-family:monospace;text-transform:uppercase;background:var(--bg-card);border-radius:2px"
              >{{ ch }}</div>
            </div>
          </div>
        </div>
        <p v-else style="color:var(--text-muted);font-size:0.85rem">No crossword words configured.</p>
      </template>

      <!-- Word Scramble -->
      <template v-if="block.type === 'word_scramble'">
        <div v-for="(w, wi) in block.words || []" :key="wi" style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.3rem">
          <span style="font-family:monospace;letter-spacing:2px;padding:0.25rem 0.5rem;background:var(--bg-main);border-radius:4px;font-size:0.95rem;min-width:120px;text-align:center">
            {{ scrambleWord(w.word) }}
          </span>
          <input
            v-if="!showAnswers"
            v-model="answers[block.id][wi]"
            :placeholder="'Unscramble'"
            :style="{
              flex: 1,
              border: checked && answers[block.id][wi]?.toLowerCase().trim() === w.word.toLowerCase()
                ? '2px solid var(--success)' : checked ? '2px solid var(--danger)' : '1px solid var(--border-color)',
              borderRadius: '4px',
            }"
            :disabled="checked"
          />
          <span v-else style="color:var(--success);font-weight:600">{{ w.word }}</span>
        </div>
      </template>

      <!-- Audio Match -->
      <template v-if="block.type === 'audio_match'">
        <div v-for="(pair, pi) in block.pairs || []" :key="pi" style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;background:var(--bg-main);padding:0.5rem 0.75rem;border-radius:8px;border:1px solid var(--border-color)">
          <button class="btn-sm" @click="playAudio(pair[1])" style="font-size:1.1rem">🔊</button>
          <span style="flex:1;font-weight:500">{{ pair[0] }}</span>
          <input
            v-if="!showAnswers"
            v-model="answers[block.id][pi]"
            :placeholder="'Translation...'"
            :style="{
              flex: 1,
              border: checked && answers[block.id][pi]?.toLowerCase().trim() === pair[1].toLowerCase()
                ? '2px solid var(--success)' : checked ? '2px solid var(--danger)' : '1px solid var(--border-color)',
              borderRadius: '4px',
            }"
          />
          <span v-else style="color:var(--success);font-weight:600;flex:1">{{ pair[1] }}</span>
        </div>
      </template>

      <!-- Dictation -->
      <template v-if="block.type === 'dictation'">
        <div>
          <button class="btn-sm" @click="playAudio(block.audioText)" style="margin-bottom:0.5rem">🔊 Play Audio</button>
          <textarea
            v-if="!showAnswers"
            v-model="answers[block.id]"
            rows="3"
            placeholder="Write what you hear..."
            style="width:100%"
            :disabled="checked"
          ></textarea>
          <div v-else style="color:var(--success);font-weight:600">{{ block.audioText }}</div>
        </div>
      </template>

      <!-- Word Search -->
      <template v-if="block.type === 'word_search'">
        <div>
          <strong>Words to Find:</strong>
          <span v-for="(w, wi) in block.words || []" :key="wi" style="display:inline-block;margin:0.15rem 0.35rem;padding:0.15rem 0.35rem;background:var(--bg-main);border-radius:4px;font-family:monospace;font-size:0.85rem">{{ typeof w === 'string' ? w : w.word }}</span>
        </div>
      </template>

      <!-- Sentence Builder -->
      <template v-if="block.type === 'sentence_builder'">
        <div v-if="!showAnswers" style="margin-top:0.25rem">
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.35rem">Click words in order to build the sentence:</p>
          <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.5rem">
            <span
              v-for="(word, si) in sentenceWords(block)"
              :key="si"
              @click="toggleSentenceWord(block.id, word)"
              :style="{
                padding: '0.25rem 0.5rem',
                background: selectedSentenceWords(block.id).includes(word) ? 'var(--primary)' : 'var(--bg-main)',
                color: selectedSentenceWords(block.id).includes(word) ? '#fff' : 'var(--text-main)',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                cursor: checked ? 'default' : 'pointer',
                fontWeight: 500,
                opacity: selectedSentenceWords(block.id).includes(word) ? 1 : 0.8,
              }"
            >{{ word }}</span>
          </div>
          <div v-if="selectedSentenceWords(block.id).length > 0" style="padding:0.5rem;background:var(--bg-card);border-radius:4px;border:1px solid var(--border-color);font-size:1.05rem">
            {{ selectedSentenceWords(block.id).join(' ') }}
          </div>
          <button v-if="selectedSentenceWords(block.id).length > 0" class="btn-sm" style="margin-top:0.35rem" @click="clearSentence(block.id)">Clear</button>
          <span v-if="checked" :style="{ color: selectedSentenceWords(block.id).join(' ').toLowerCase() === block.sentence.toLowerCase() ? 'var(--success)' : 'var(--danger)', marginLeft: '0.5rem', fontWeight: 600 }">
            {{ selectedSentenceWords(block.id).join(' ').toLowerCase() === block.sentence.toLowerCase() ? '✓ Correct' : '✗ Try again' }}
          </span>
        </div>
        <div v-else style="color:var(--success);font-weight:600;margin-top:0.25rem">{{ block.sentence }}</div>
      </template>

      <!-- Odd One Out -->
      <template v-if="block.type === 'odd_one_out'">
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.25rem">
          <button
            v-for="(item, idx) in block.items || []"
            :key="idx"
            @click="!checked && !showAnswers ? (answers[block.id] = idx) : null"
            :style="{
              padding: '0.4rem 0.8rem',
              background: showAnswers && block.correct === idx
                ? 'var(--success)'
                : !showAnswers && answers[block.id] === idx
                  ? 'var(--primary)' : 'var(--bg-main)',
              color: showAnswers || answers[block.id] === idx ? '#fff' : 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: (checked || showAnswers) ? 'default' : 'pointer',
              opacity: showAnswers && block.correct !== idx ? 0.5 : 1,
            }"
          >{{ item }}</button>
        </div>
        <div v-if="checked || showAnswers" style="margin-top:0.5rem;padding:0.5rem;background:rgba(34,197,94,0.08);border-radius:4px;font-size:0.85rem">
          <strong>Answer:</strong> {{ block.items?.[block.correct] }}
          <span v-if="block.reason" style="color:var(--text-muted)"> — {{ block.reason }}</span>
        </div>
      </template>
    </div>

    <div class="card" style="margin-top: 1rem">
      <strong>Total Points: {{ totalPoints }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import MermaidDiagram from '../components/exercises/MermaidDiagram.vue'
import Vocabulary from '../components/exercises/Vocabulary.vue'
import SemanticSorter from '../components/exercises/SemanticSorter.vue'
import Flashcards from '../components/exercises/Flashcards.vue'
import ScratchpadCanvas from '../components/exercises/ScratchpadCanvas.vue'

function youtubeEmbed(url: string) {
  if (!url) return ''
  const id = url.match(/(?:v=|\/)([\w-]{11})/)
  return id ? `https://www.youtube.com/embed/${id[1]}` : ''
}

const route = useRoute()
const router = useRouter()
const store = useWorksheetsStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const worksheet = ref(null)
const blocks = ref<Array<Record<string, any>>>([])
const GRADE_LABELS: Record<string, string> = {
  '1': '1. Klasse (5. Schulstufe)',
  '2': '2. Klasse (6. Schulstufe)',
  '3': '3. Klasse (7. Schulstufe)',
  '4': '4. Klasse (8. Schulstufe)',
  '5': '1. Klasse (5. Schulstufe)',
  '6': '2. Klasse (6. Schulstufe)',
  '7': '3. Klasse (7. Schulstufe)',
  '8': '4. Klasse (8. Schulstufe)',
}
function formatGrade(g: string | undefined): string {
  return g ? (GRADE_LABELS[g] || `Klasse ${g}`) : ''
}
const answers = reactive<Record<string, any>>({})
const showAnswers = ref(false)
const checked = ref(false)
const score = ref(0)
const blockResults = reactive<Record<number, boolean>>({})
const sentenceSelections = reactive<Record<string, string[]>>({})

const isTeacher = computed(() => authStore.role === 'teacher' || authStore.role === 'admin')
const totalPoints = computed(() => blocks.value.reduce((s: number, b: Record<string, any>) => s + (b.points || 0), 0))

// Initialize answer storage for each block
function initAnswers() {
  for (const block of blocks.value) {
    if (!answers[block.id]) {
      if (block.type === 'gap_fill' || block.type === 'drag_words' || block.type === 'matching' || block.type === 'audio_match') {
        answers[block.id] = {}
      } else if (block.type === 'multiple_choice') {
        answers[block.id] = []
      } else if (block.type === 'word_scramble' || block.type === 'correct_words') {
        answers[block.id] = {}
      } else if (block.type === 'question_table' || block.type === 'ordering') {
        answers[block.id] = {}
      } else if (block.type === 'sentence_builder') {
        sentenceSelections[block.id] = []
      } else {
        answers[block.id] = null
      }
    }
  }
}

// Check answers against correct answers in the block
function checkAnswers() {
  checked.value = true
  let earned = 0
  for (let bi = 0; bi < blocks.value.length; bi++) {
    const block = blocks.value[bi]
    const result = gradeBlock(block)
    blockResults[bi] = result.correct
    earned += result.earned
  }
  score.value = earned
}

function gradeBlock(block: Record<string, any>): { correct: boolean; earned: number } {
  const pts = block.points || 0
  const ans = answers[block.id]

  switch (block.type) {
    case 'gap_fill': {
      const template = block.template || ''
      const gaps = [...template.matchAll(/\(\((.*?)\)\)/g)]
      let correct = 0
      for (const g of gaps) {
        const segKey = `g_${g.index}`
        const userVal = ans?.[segKey] || ''
        if (userVal.toLowerCase().trim() === g[1].toLowerCase().trim()) correct++
      }
      const earned = gaps.length > 0 ? Math.round((correct / gaps.length) * pts) : 0
      return { correct: correct === gaps.length, earned }
    }
    case 'multiple_choice': {
      const correctIndices = (block.correct || []) as number[]
      const userSel = (ans || []) as number[]
      const isCorrect = correctIndices.length === userSel.length && correctIndices.every((i) => userSel.includes(i))
      return { correct: isCorrect, earned: isCorrect ? pts : 0 }
    }
    case 'single_choice': {
      return { correct: ans === block.correct, earned: ans === block.correct ? pts : 0 }
    }
    case 'true_false': {
      const correctAnswer = block.correct_answer === true
      const userAnswer = ans === 'true'
      return { correct: userAnswer === correctAnswer, earned: userAnswer === correctAnswer ? pts : 0 }
    }
    case 'matching': {
      const pairs = block.pairs || []
      let correct = 0
      for (let i = 0; i < pairs.length; i++) {
        if ((ans?.[i] || '').toLowerCase().trim() === (pairs[i][1] || '').toLowerCase().trim()) correct++
      }
      const earned = pairs.length > 0 ? Math.round((correct / pairs.length) * pts) : 0
      return { correct: correct === pairs.length, earned }
    }
    case 'short_answer': {
      const keywords = (block.keywords || []) as string[]
      const userVal = (ans || '').toLowerCase()
      let hits = 0
      for (const kw of keywords) {
        if (userVal.includes(kw.toLowerCase())) hits++
      }
      return { correct: hits >= Math.ceil(keywords.length * 0.6), earned: keywords.length > 0 ? Math.round((hits / keywords.length) * pts) : 0 }
    }
    case 'word_scramble': {
      const words = block.words || []
      let correct = 0
      for (let i = 0; i < words.length; i++) {
        if ((ans?.[i] || '').toLowerCase().trim() === (words[i].word || words[i]).toLowerCase().trim()) correct++
      }
      const earned = words.length > 0 ? Math.round((correct / words.length) * pts) : 0
      return { correct: correct === words.length, earned }
    }
    case 'drag_words':
    case 'correct_words': {
      // Same logic as gap_fill for input-based fill exercises
      const tpl = block.template || ''
      const g = [...tpl.matchAll(/\(\((.*?)\)\)/g)]
      let correct = 0
      for (const match of g) {
        const segKey = `g_${match.index}`
        const userVal = ans?.[segKey] || ''
        if (userVal.toLowerCase().trim() === match[1].toLowerCase().trim()) correct++
      }
      const earned = g.length > 0 ? Math.round((correct / g.length) * pts) : 0
      return { correct: correct === g.length, earned }
    }
    case 'question_table': {
      const rows = block.rows || []
      let correct = 0
      for (let i = 0; i < rows.length; i++) {
        const expected = rows[i].split('##')[1]
        if (expected && ans?.[i] === expected) correct++
      }
      const earned = rows.length > 0 ? Math.round((correct / rows.length) * pts) : 0
      return { correct: correct === rows.length, earned }
    }
    case 'ordering': {
      const items = block.items || []
      const userOrder = ans ? Object.values(ans) : []
      // For ordering, check items are in ascending index order (default)
      const allAscending = userOrder.every((_, i) => i === 0 || Number(userOrder[i]) >= Number(userOrder[i - 1]))
      return { correct: allAscending, earned: allAscending ? pts : 0 }
    }
    case 'odd_one_out': {
      return { correct: ans === block.correct, earned: ans === block.correct ? pts : 0 }
    }
    case 'sentence_builder': {
      const built = (sentenceSelections[block.id] || []).join(' ').toLowerCase()
      const expected = (block.sentence || '').toLowerCase()
      return { correct: built === expected, earned: built === expected ? pts : 0 }
    }
    case 'dictation':
    case 'audio_match': {
      // For dictation: exact text match
      if (block.type === 'dictation') {
        const isCorrect = (ans || '').toLowerCase().trim() === (block.audioText || '').toLowerCase().trim()
        return { correct: isCorrect, earned: isCorrect ? pts : 0 }
      }
      // For audio_match: pairs
      const pairs = block.pairs || []
      let correct = 0
      for (let i = 0; i < pairs.length; i++) {
        if ((ans?.[i] || '').toLowerCase().trim() === (pairs[i][1] || '').toLowerCase().trim()) correct++
      }
      const earned = pairs.length > 0 ? Math.round((correct / pairs.length) * pts) : 0
      return { correct: correct === pairs.length, earned }
    }
    default:
      return { correct: false, earned: 0 }
  }
}

function toggleMcAnswer(blockId: string, oi: number) {
  if (!answers[blockId]) answers[blockId] = []
  const arr = answers[blockId] as number[]
  const idx = arr.indexOf(oi)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(oi)
}

function moveOrderItem(blockId: string, idx: number, dir: number) {
  const items = blocks.value.find(b => b.id === blockId)?.items
  if (!items) return
  const target = idx + dir
  if (target < 0 || target >= items.length) return
  ;[items[idx], items[target]] = [items[target], items[idx]]
  // Update answer tracking
  if (!answers[blockId]) answers[blockId] = {}
  for (let i = 0; i < items.length; i++) {
    answers[blockId][i] = items[i]
  }
}

function orderingItems(block: Record<string, any>): string[] {
  return block.items || []
}

function sentenceWords(block: Record<string, any>): string[] {
  if (!block.sentence) return []
  return block.sentence.split(/\s+/).filter(Boolean)
}

function selectedSentenceWords(blockId: string): string[] {
  return sentenceSelections[blockId] || []
}

function toggleSentenceWord(blockId: string, word: string) {
  if (checked.value) return
  if (!sentenceSelections[blockId]) sentenceSelections[blockId] = []
  const arr = sentenceSelections[blockId]
  const idx = arr.indexOf(word)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(word)
}

function clearSentence(blockId: string) {
  sentenceSelections[blockId] = []
}

function scrambleWord(word: string): string {
  if (!word) return ''
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

function playAudio(text: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}

async function cloneWorksheet() {
  if (!worksheet.value) return
  try {
    let cloned
    if (worksheet.value.in_library) {
      cloned = await store.cloneLibraryWorksheet(worksheet.value.id)
    } else {
      cloned = await store.duplicateWorksheet(worksheet.value.id)
    }
    uiStore.showToast('Worksheet duplicated successfully!', 'success')
    router.push(`/teacher/builder/${cloned.id}`)
  } catch (err: any) {
    uiStore.showToast(err.message || 'Failed to clone worksheet', 'error')
  }
}

function goBack() {
  if (route.query.from === 'bank') {
    router.push('/teacher/bank')
  } else {
    router.push('/teacher')
  }
}

onMounted(async () => {
  await store.fetchWorksheet(route.params.id)
  worksheet.value = store.current
  if (store.current) {
    try {
      const content = JSON.parse(store.current.content)
      blocks.value = content.blocks || []
    } catch {
      blocks.value = []
    }
  }
  initAnswers()
})

function parseGapPreviewTemplate(template: string): Array<
  | { type: 'text'; text: string; key: string }
  | { type: 'gap'; answer: string; key: string }
> {
  const segments: Array<
    | { type: 'text'; text: string; key: string }
    | { type: 'gap'; answer: string; key: string }
  > = []
  if (!template) return segments
  let lastIndex = 0
  const regex = /\(\((.*?)\)\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: template.slice(lastIndex, match.index),
        key: `t_${lastIndex}_${match.index}`,
      })
    }
    segments.push({
      type: 'gap',
      answer: match[1],
      key: `g_${match.index}`,
    })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < template.length) {
    segments.push({
      type: 'text',
      text: template.slice(lastIndex),
      key: `t_${lastIndex}_${template.length}`,
    })
  }
  return segments
}

function getGapPreviewSegments(template: string) {
  return parseGapPreviewTemplate(template)
}

function getCorrectWordsSegments(template: string) {
  const segments: Array<{ type: 'text'; text: string } | { type: 'word'; index: number; wrong: string; correct: string }> = []
  if (!template) return segments
  let lastIndex = 0
  let wordIndex = 0
  const regex = /\(\((.*?)\)\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: template.slice(lastIndex, match.index),
      })
    }
    const parts = match[1].split('/')
    segments.push({
      type: 'word',
      index: wordIndex++,
      wrong: parts[0] || '',
      correct: parts[1] || parts[0] || '',
    })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < template.length) {
    segments.push({
      type: 'text',
      text: template.slice(lastIndex),
    })
  }
  return segments
}
</script>
