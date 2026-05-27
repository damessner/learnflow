<template>
  <div class="page builder-page">
    <div class="builder-layout">
      <!-- ===== Left Sidebar (sticky) ===== -->
      <aside class="builder-sidebar">
        <!-- Header row -->
        <div class="sidebar-header">
          <div class="sidebar-header-title">
            <h2>{{ isEditing ? '✏️ Edit Worksheet' : '📝 New Worksheet' }}</h2>
          </div>
          <button class="btn-primary" @click="save" style="flex-shrink:0">Save</button>
        </div>

        <!-- Settings (collapsible) -->
        <div class="sidebar-section" style="margin-bottom:0">
          <button class="collapse-toggle" @click="titlePanelOpen = !titlePanelOpen">
            <span class="collapse-toggle-label">📋 Worksheet Settings</span>
            <span class="collapse-arrow" :class="{ open: titlePanelOpen }">▾</span>
          </button>
          <div class="card sidebar-card" style="margin-top:0.25rem">
            <div class="form-group" style="margin-bottom:0.35rem">
              <label>Title</label>
              <input v-model="form.title" placeholder="Worksheet title" />
            </div>
            <div v-show="titlePanelOpen">
              <div style="display:flex;gap:0.5rem">
                <div class="form-group" style="flex:1">
                  <label>Subject</label>
                  <select v-model="form.subject">
                    <option value="">-- Select --</option>
                    <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
                <div class="form-group" style="flex:1">
                  <label>Grade</label>
                  <select v-model="form.grade_level">
                    <option value="">-- Select --</option>
                    <option v-for="g in gradeLevels" :key="g" :value="g">Klasse {{ g }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label>Description</label>
                <textarea v-model="form.description" rows="2" placeholder="Optional description" @input="autoExpand($event)"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Generator (collapsible) -->
        <div class="sidebar-section">
          <button class="collapse-toggle" @click="aiPanelOpen = !aiPanelOpen">
            <span class="collapse-toggle-label">🤖 AI Generator</span>
            <span class="collapse-arrow" :class="{ open: aiPanelOpen }">▾</span>
          </button>
          <div v-show="aiPanelOpen" class="collapse-content">
            <textarea
              v-model="aiPrompt"
              rows="3"
              placeholder="Describe the worksheet..."
              style="font-size:0.75rem;margin-bottom:0.35rem"
              @input="autoExpand($event)"
            ></textarea>
            <div v-if="lernzieleTemplates.length" style="margin-bottom:0.2rem">
              <select style="font-size:0.68rem;padding:0.2rem;width:100%" @change="e => { if (e.target.value) { aiLernziele = e.target.value; e.target.value = '' } }">
                <option value="">📚 Lernziel-Vorlage wählen…</option>
                <option v-for="t in lernzieleTemplates" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <textarea
              v-model="aiLernziele"
              rows="2"
              placeholder="Lernziele (optional)"
              style="font-size:0.7rem;margin-bottom:0.35rem"
              @input="autoExpand($event)"
            ></textarea>
            <div style="margin-bottom:0.35rem">
              <div v-if="differentiateTemplates.length" style="margin-bottom:0.2rem">
                <select style="font-size:0.68rem;padding:0.2rem;width:100%" @change="e => { if (e.target.value) { conceptInput = e.target.value; e.target.value = '' } }">
                  <option value="">🔀 Konzept-Vorlage wählen…</option>
                  <option v-for="t in differentiateTemplates" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div style="display:flex;gap:0.35rem">
                <input
                  v-model="conceptInput"
                  placeholder="Differentiate concept..."
                  style="font-size:0.7rem;flex:1"
                />
                <button class="btn-sm" :disabled="differentiateLoading" @click="differentiateConcept()">
                  {{ differentiateLoading ? '...' : 'Levels' }}
                </button>
              </div>
            </div>
            <div v-if="differentiatedConcept" class="card" style="padding:0.5rem;margin-bottom:0.35rem;font-size:0.72rem">
              <strong>Basic</strong>
              <p style="margin:0.2rem 0 0.4rem;white-space:pre-wrap">{{ differentiatedConcept.basic }}</p>
              <strong>Standard</strong>
              <p style="margin:0.2rem 0 0.4rem;white-space:pre-wrap">{{ differentiatedConcept.standard }}</p>
              <strong>Advanced</strong>
              <p style="margin:0.2rem 0 0.4rem;white-space:pre-wrap">{{ differentiatedConcept.advanced }}</p>
              <button class="btn-sm" @click="insertDifferentiatedInfoBox()">+ Add as Info Box</button>
            </div>
            <div style="display:flex;gap:0.25rem;margin-bottom:0.35rem;flex-wrap:wrap">
              <select v-model="aiStyle" style="font-size:0.65rem;padding:0.2rem;flex:1;min-width:60px">
                <option value="practice">Practice</option>
                <option value="test">Test</option>
                <option value="revision">Revision</option>
                <option value="challenge">Challenge</option>
              </select>
              <select v-model="aiDifficulty" style="font-size:0.65rem;padding:0.2rem;flex:1;min-width:50px">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select v-model="aiLength" style="font-size:0.65rem;padding:0.2rem;flex:1;min-width:50px">
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <button
              class="btn-primary"
              :disabled="aiLoading"
              @click="sidebarGenerate()"
              style="width:100%;font-size:0.75rem;padding:0.35rem"
            >
              {{ aiLoading ? 'Generating...' : 'Generate' }}
            </button>
          </div>
        </div>

        <!-- Block Toolbar -->
        <div class="sidebar-section">
          <h3 class="sidebar-heading">Questions</h3>
          <div class="block-grid">
            <button class="block-btn" @click="addBlock('text')"><span class="block-btn-icon">📄</span> Text</button>
            <button class="block-btn" @click="addBlock('info_box')"><span class="block-btn-icon">💡</span> Info Box</button>
            <button class="block-btn" @click="addBlock('gap_fill')"><span class="block-btn-icon">✏️</span> Gap Fill</button>
            <button class="block-btn" @click="addBlock('multiple_choice')"><span class="block-btn-icon">✅</span> Multi Choice</button>
            <button class="block-btn" @click="addBlock('single_choice')"><span class="block-btn-icon">☑️</span> Single Choice</button>
            <button class="block-btn" @click="addBlock('short_answer')"><span class="block-btn-icon">📝</span> Short Answer</button>
            <button class="block-btn" @click="addBlock('true_false')"><span class="block-btn-icon">⚖️</span> True/False</button>
            <button class="block-btn" @click="addBlock('matching')"><span class="block-btn-icon">🔗</span> Matching</button>
            <button class="block-btn" @click="addBlock('ordering')"><span class="block-btn-icon">🔢</span> Ordering</button>
            <button class="block-btn" @click="addBlock('word_scramble')"><span class="block-btn-icon">🔤</span> Scramble</button>
            <button class="block-btn" @click="addBlock('read_aloud')"><span class="block-btn-icon">🔊</span> Read Aloud</button>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-heading">Mathematik</h3>
          <div class="block-grid">
            <button class="block-btn" @click="addBlock('fraction_input')"><span class="block-btn-icon">🧮</span> Bruch</button>
            <button class="block-btn" @click="addBlock('fraction_model')"><span class="block-btn-icon">🍕</span> Bruchbild</button>
            <button class="block-btn" @click="addBlock('percentage')"><span class="block-btn-icon">💯</span> Prozent</button>
            <button class="block-btn" @click="addBlock('equation_entry')"><span class="block-btn-icon">=️⃣</span> Gleichung</button>
            <button class="block-btn" @click="addBlock('unit_conversion')"><span class="block-btn-icon">🔄</span> Einheiten</button>
            <button class="block-btn" @click="addBlock('number_line')"><span class="block-btn-icon">📏</span> Zahlenstrahl</button>
            <button class="block-btn" @click="addBlock('angle')"><span class="block-btn-icon">📐</span> Winkel</button>
            <button class="block-btn" @click="addBlock('arithmetic_grid')"><span class="block-btn-icon">➕</span> Grundrechnung</button>
            <button class="block-btn" @click="addBlock('word_problem')"><span class="block-btn-icon">📖</span> Textaufgabe</button>
            <button class="block-btn" @click="addBlock('graph_plot')"><span class="block-btn-icon">📊</span> Diagramm</button>
            <button class="block-btn" @click="addBlock('geometry_shape')"><span class="block-btn-icon">🔷</span> Geometrie</button>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-heading">Media</h3>
          <div class="block-grid">
            <button class="block-btn" @click="addBlock('media')"><span class="block-btn-icon">🖼️</span> Image</button>
            <button class="block-btn" @click="addBlock('audio')"><span class="block-btn-icon">🎵</span> Audio</button>
            <button class="block-btn" @click="addBlock('video')"><span class="block-btn-icon">🎬</span> Video</button>
            <button class="block-btn" @click="addBlock('youtube')"><span class="block-btn-icon">📺</span> YouTube</button>
            <button class="block-btn" @click="addBlock('drawing')"><span class="block-btn-icon">🎨</span> Drawing</button>
          </div>
        </div>

        <!-- Version History (collapsible) -->
        <div v-if="isEditing && versionHistory.length" class="sidebar-section">
          <button class="collapse-toggle" @click="versionPanelOpen = !versionPanelOpen">
            <span class="collapse-toggle-label">📋 Version History</span>
            <span class="collapse-arrow" :class="{ open: versionPanelOpen }">▾</span>
          </button>
          <div v-show="versionPanelOpen" class="collapse-content">
            <div style="display:flex;justify-content:flex-end;margin-bottom:0.35rem">
              <button class="btn-sm" :disabled="versionLoading" @click="loadVersions()">
                {{ versionLoading ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.35rem">
              <div
                v-for="version in versionHistory"
                :key="version.id"
                style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.35rem;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px"
              >
                <div style="font-size:0.72rem;line-height:1.3">
                  <div style="font-weight:600">v{{ version.version_number }}</div>
                  <div style="color:var(--text-muted);font-size:0.65rem">{{ version.change_summary || 'Saved' }}</div>
                  <div style="color:var(--text-muted);font-size:0.6rem">{{ formatVersionDate(version.created_at) }}</div>
                </div>
                <button class="btn-sm" style="font-size:0.6rem;flex-shrink:0" @click="restoreVersion(version.id)">Restore</button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ===== Right Main Area (flex, scrollable) ===== -->
      <main class="builder-main">
        <!-- Empty state -->
        <div v-if="blocks.length === 0" class="card empty-state" style="text-align:center;color:var(--text-muted);padding:3rem">
          <div style="font-size:3rem;margin-bottom:0.5rem;opacity:0.3">📝</div>
          <p>Add exercise blocks from the sidebar to start building your worksheet</p>
        </div>

        <!-- Block cards -->
        <div
          v-for="(block, idx) in blocks"
          :key="block.id"
          class="card block-card"
        >
          <!-- Block header row -->
          <div class="block-card-header">
            <div class="block-card-title">
              <span class="block-type-icon">{{ blockIcons[block.type] || '📄' }}</span>
              <strong>{{ germanBlockLabel[block.type] || block.type.replace(/_/g, ' ') }}</strong>
            </div>
            <div class="block-card-controls">
              <label class="pts-label">Pts:</label>
              <input v-model.number="block.points" type="number" class="pts-input" min="0" />
              <button class="btn-sm" :disabled="idx === 0" @click="moveBlock(idx, -1)" title="Move up">↑</button>
              <button class="btn-sm" :disabled="idx === blocks.length - 1" @click="moveBlock(idx, 1)" title="Move down">↓</button>
              <button class="btn-sm btn-danger" @click="removeBlock(idx)" title="Delete block">×</button>
            </div>
          </div>

          <!-- AI Regenerate toolbar -->
          <div v-if="canAiRegenerate(block.type)" class="block-ai-toolbar">
            <button class="btn-sm" style="font-size:0.65rem;padding:0.15rem 0.4rem" @click="regenerateBlock(idx)" :disabled="aiLoading" title="Regenerate this block with AI">🔄 AI Regenerate</button>
            <button class="btn-sm" style="font-size:0.65rem;padding:0.15rem 0.4rem" @click="regenerateBlockWithInstruction(idx, 'easier')" :disabled="aiLoading" title="Make this easier">🔽 Easier</button>
            <button class="btn-sm" style="font-size:0.65rem;padding:0.15rem 0.4rem" @click="regenerateBlockWithInstruction(idx, 'harder')" :disabled="aiLoading" title="Make this harder">🔼 Harder</button>
          </div>

          <!-- Block fields -->
          <div class="block-card-body">
            <!-- Textarea for question-based blocks (exclude text, read_aloud, info_box which have their own) -->
            <div v-if="block.type !== 'text' && block.type !== 'read_aloud' && block.type !== 'info_box' && block.type !== 'true_false'" class="form-group">
              <textarea
                v-model="block.text"
                rows="2"
                :placeholder="'Write your question for this ' + block.type.replace(/_/g, ' ') + '...'"
                @input="autoExpand($event)"
              ></textarea>
            </div>

            <!-- Gap Fill -->
            <template v-if="block.type === 'gap_fill'">
              <div class="form-group">
                <label>Template (use ((answer)) placeholders)</label>
                <textarea
                  v-model="block.template"
                  rows="3"
                  placeholder="Text with ((answer)) placeholders"
                  @input="autoExpand($event)"
                ></textarea>
              </div>
            </template>

            <!-- Multiple Choice / Single Choice -->
            <template v-if="block.type === 'multiple_choice' || block.type === 'single_choice'">
              <div
                v-for="(opt, oi) in block.options || []"
                :key="oi"
                style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.25rem"
              >
                <input
                  v-if="block.type === 'multiple_choice'"
                  v-model="block.correct"
                  type="checkbox"
                  :value="oi"
                  style="width:auto;flex-shrink:0"
                />
                <input
                  v-else
                  v-model="block.correct"
                  type="radio"
                  :value="oi"
                  name="correct"
                  style="width:auto;flex-shrink:0"
                />
                <input
                  v-model="block.options[oi]"
                  :placeholder="`Option ${oi + 1}`"
                  style="flex:1"
                />
                <button class="btn-sm btn-danger" @click="block.options.splice(oi, 1)">×</button>
              </div>
              <button class="btn-sm" @click="block.options = [...(block.options || []), '']">+ Option</button>
            </template>

            <!-- True / False -->
            <template v-if="block.type === 'true_false'">
              <div class="form-group">
                <label>Statement</label>
                <textarea v-model="block.text" rows="2" placeholder="Enter the statement to evaluate..." @input="autoExpand($event)"></textarea>
              </div>
              <div style="display:flex;gap:1.5rem;margin-top:0.35rem">
                <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.85rem;cursor:pointer">
                  <input type="radio" v-model="block.correct_answer" :value="true" style="width:auto" /> True
                </label>
                <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.85rem;cursor:pointer">
                  <input type="radio" v-model="block.correct_answer" :value="false" style="width:auto" /> False
                </label>
              </div>
            </template>

            <!-- Matching -->
            <template v-if="block.type === 'matching'">
              <div
                v-for="(pair, pi) in block.pairs || []"
                :key="pi"
                style="display:flex;gap:0.5rem;margin-bottom:0.25rem"
              >
                <input v-model="pair[0]" placeholder="Left" style="flex:1" />
                <span style="color:var(--text-muted)">→</span>
                <input v-model="pair[1]" placeholder="Right" style="flex:1" />
                <button class="btn-sm btn-danger" @click="block.pairs.splice(pi, 1)">×</button>
              </div>
              <button class="btn-sm" @click="block.pairs = [...(block.pairs || []), ['', '']]">+ Pair</button>
            </template>

            <!-- Ordering -->
            <template v-if="block.type === 'ordering'">
              <div class="form-group">
                <label>Instruction</label>
                <textarea v-model="block.text" rows="1" placeholder="Put these items in the correct order..." @input="autoExpand($event)"></textarea>
              </div>
              <div
                v-for="(item, oi) in block.items || []"
                :key="oi"
                style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.25rem"
              >
                <span style="font-size:0.8rem;color:var(--text-muted);min-width:1.5rem;text-align:right;font-weight:600">{{ oi + 1 }}.</span>
                <input v-model="block.items[oi]" :placeholder="`Item ${oi + 1}`" style="flex:1" />
                <button class="btn-sm btn-danger" @click="block.items.splice(oi, 1)">×</button>
              </div>
              <button class="btn-sm" @click="block.items = [...(block.items || []), '']">+ Add Item</button>
            </template>

            <!-- Short Answer -->
            <template v-if="block.type === 'short_answer'">
              <div class="form-group">
                <label>Keywords (comma-separated)</label>
                <input v-model="block.keywordsStr" placeholder="keyword1, keyword2" />
              </div>
            </template>

            <!-- Text / Read Aloud -->
            <template v-if="block.type === 'text' || block.type === 'read_aloud'">
              <div class="form-group">
                <label>Content</label>
                <textarea v-model="block.text" rows="3" placeholder="Enter text content..." @input="autoExpand($event)"></textarea>
              </div>
            </template>

            <!-- Info Box -->
            <template v-if="block.type === 'info_box'">
              <div class="form-group">
                <label>Headline</label>
                <input v-model="block.title" placeholder="Clickable headline (e.g. 'Did you know?')" style="font-weight:600" />
              </div>
              <div class="form-group">
                <label>Content</label>
                <textarea v-model="block.text" rows="3" placeholder="Info content shown when clicked..." @input="autoExpand($event)"></textarea>
              </div>
              <div class="form-group">
                <label>Mermaid Diagram (optional)</label>
                <input v-model="block.mermaid" placeholder="Mermaid.js diagram code" style="font-size:0.7rem" />
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label>Alt Text (optional)</label>
                <input v-model="block.alt_text" placeholder="Alt text for diagram" style="font-size:0.7rem" />
              </div>
            </template>

            <!-- Word Scramble -->
            <template v-if="block.type === 'word_scramble'">
              <label style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem;font-size:0.8rem">
                <input type="checkbox" v-model="block.sentence_mode" /> Sentence mode (scramble word order)
              </label>
              <div
                v-for="(w, wi) in block.words || []"
                :key="wi"
                style="display:flex;gap:0.25rem;margin-bottom:0.25rem"
              >
                <input v-model="block.words[wi].word" :placeholder="block.sentence_mode ? 'Sentence' : 'Word'" style="flex:1" />
                <button class="btn-sm btn-danger" @click="block.words.splice(wi, 1)">×</button>
              </div>
              <button class="btn-sm" @click="block.words = [...(block.words || []), { word: '' }]">
                + {{ block.sentence_mode ? 'Sentence' : 'Word' }}
              </button>
            </template>

            <!-- Number Line -->
            <template v-if="block.type === 'number_line'">
              <div style="display:flex;gap:0.5rem">
                <div class="form-group" style="flex:1">
                  <label>Min</label>
                  <input v-model.number="block.min_value" type="number" />
                </div>
                <div class="form-group" style="flex:1">
                  <label>Max</label>
                  <input v-model.number="block.max_value" type="number" />
                </div>
                <div class="form-group" style="flex:1">
                  <label>Markierung</label>
                  <input v-model="block.markers[0]" type="number" placeholder="Markierung" />
                </div>
              </div>
            </template>

            <!-- Equation Entry -->
            <template v-if="block.type === 'equation_entry'">
              <div class="form-group">
                <label>Gleichung</label>
                <input v-model="block.equation" placeholder="Gleichung (z.B. 3*x + 5 = 14)" />
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label>Lösung</label>
                <input v-model="block.final_answer" placeholder="Lösung" />
              </div>
            </template>

            <!-- Fraction Input -->
            <template v-if="block.type === 'fraction_input'">
              <div style="display:flex;gap:0.5rem;align-items:center">
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Zähler</label>
                  <input v-model.number="block.numerator" type="number" placeholder="Zähler" />
                </div>
                <span style="font-size:1.2rem;margin-top:1.2rem">/</span>
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Nenner</label>
                  <input v-model.number="block.denominator" type="number" placeholder="Nenner" />
                </div>
              </div>
            </template>

            <!-- Fraction Model (Visualizer) -->
            <template v-if="block.type === 'fraction_model'">
              <div class="form-group">
                <textarea v-model="block.text" rows="2" placeholder="Frage oder Anweisung (optional)..." @input="autoExpand($event)"></textarea>
              </div>
              <div style="display:flex;gap:0.75rem;align-items:flex-start;flex-wrap:wrap">
                <div style="display:flex;gap:0.5rem;align-items:center">
                  <div class="form-group" style="width:70px;margin-bottom:0">
                    <label>Zähler</label>
                    <input v-model.number="block.numerator" type="number" min="0" />
                  </div>
                  <span style="font-size:1.2rem;margin-top:1.2rem">/</span>
                  <div class="form-group" style="width:70px;margin-bottom:0">
                    <label>Nenner</label>
                    <input v-model.number="block.denominator" type="number" min="1" />
                  </div>
                </div>
                <div class="form-group" style="width:100px;margin-bottom:0">
                  <label>Darstellung</label>
                  <select v-model="block.model_type">
                    <option value="circle">Kreis</option>
                    <option value="bar">Streifen</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom:0;padding-top:1.2rem">
                  <label style="display:flex;align-items:center;gap:0.3rem;font-size:0.8rem">
                    <input type="checkbox" v-model="block.show_labels" /> Beschriftung
                  </label>
                </div>
              </div>
              <!-- SVG preview -->
              <div style="margin-top:0.75rem;display:flex;justify-content:center;background:var(--bg-card);border-radius:8px;padding:0.75rem;border:1px solid var(--border-color)">
                <svg :viewBox="fractionViewBox(block)" :width="fractionSvgWidth(block)" :height="fractionSvgHeight(block)" style="max-width:100%">
                  <template v-if="block.model_type === 'circle'">
                    <g v-for="i in fractionIndices(block)" :key="i">
                      <path :d="fractionSlicePath(i, block)" :fill="i < (block.numerator || 0) ? '#3b82f6' : '#f3f4f6'" stroke="#94a3b8" stroke-width="1" />
                    </g>
                    <circle cx="100" cy="100" r="98" fill="none" stroke="#64748b" stroke-width="1.5" />
                    <text v-if="block.show_labels" x="100" y="105" text-anchor="middle" font-size="14" font-weight="600" fill="#1e293b">
                      {{ block.numerator || 0 }}/{{ block.denominator || 1 }}
                    </text>
                  </template>
                  <template v-else>
                    <g v-for="i in fractionIndices(block)" :key="i">
                      <rect :x="i * (240 / Math.max(1, block.denominator || 1))" y="0"
                        :width="Math.max(0, (240 / Math.max(1, block.denominator || 1)) - 1)" height="60"
                        :fill="i < (block.numerator || 0) ? '#3b82f6' : '#f3f4f6'" stroke="#94a3b8" stroke-width="1" rx="2" />
                    </g>
                    <text v-if="block.show_labels" x="120" y="82" text-anchor="middle" font-size="14" font-weight="600" fill="#1e293b">
                      {{ block.numerator || 0 }}/{{ block.denominator || 1 }}
                    </text>
                  </template>
                </svg>
              </div>
            </template>

            <!-- Arithmetic Grid -->
            <template v-if="block.type === 'arithmetic_grid'">
              <div style="display:flex;gap:0.5rem;align-items:center">
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Operand A</label>
                  <input v-model.number="block.operand1" type="number" placeholder="A" />
                </div>
                <div class="form-group" style="width:70px;margin-bottom:0">
                  <label>Op</label>
                  <select v-model="block.operation">
                    <option value="add">Plus</option>
                    <option value="subtract">Minus</option>
                    <option value="multiply">Mal</option>
                    <option value="divide">Geteilt</option>
                  </select>
                </div>
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Operand B</label>
                  <input v-model.number="block.operand2" type="number" placeholder="B" />
                </div>
              </div>
            </template>

            <!-- Graph Plot -->
            <template v-if="block.type === 'graph_plot'">
              <div class="form-group">
                <label>Points to plot (JSON array)</label>
                <textarea
                  v-model="block.pointsStr"
                  rows="2"
                  placeholder="[[x,y],[x,y]]"
                  @blur="tryParsePoints(block)"
                  @input="autoExpand($event)"
                ></textarea>
              </div>
            </template>

            <!-- Geometry Shape -->
            <template v-if="block.type === 'geometry_shape'">
              <div class="form-group">
                <label>Shape Type</label>
                <select v-model="block.shape_type">
                  <option value="triangle">Dreieck</option>
                  <option value="square">Quadrat</option>
                  <option value="rectangle">Rechteck</option>
                  <option value="circle">Kreis</option>
                </select>
              </div>
            </template>

            <!-- Percentage -->
            <template v-if="block.type === 'percentage'">
              <div style="display:flex;gap:0.5rem">
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Prozent %</label>
                  <input v-model.number="block.percentage_value" type="number" placeholder="Prozent" />
                </div>
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Anteil</label>
                  <input v-model.number="block.part_value" type="number" placeholder="Anteil" />
                </div>
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Grundwert</label>
                  <input v-model.number="block.whole_value" type="number" placeholder="Grundwert" />
                </div>
              </div>
            </template>

            <!-- Unit Conversion -->
            <template v-if="block.type === 'unit_conversion'">
              <div style="display:flex;gap:0.5rem;align-items:flex-end">
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Wert</label>
                  <input v-model.number="block.value" type="number" placeholder="Wert" />
                </div>
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Von</label>
                  <input v-model="block.from_unit" placeholder="z.B. cm, kg, min" />
                </div>
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Nach</label>
                  <input v-model="block.to_unit" placeholder="z.B. m, g, h" />
                </div>
              </div>
            </template>

            <!-- Angle -->
            <template v-if="block.type === 'angle'">
              <div style="display:flex;gap:0.5rem;align-items:flex-end">
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Grad</label>
                  <input v-model.number="block.expected_degrees" type="number" placeholder="Grad" />
                </div>
                <div class="form-group" style="flex:1;margin-bottom:0">
                  <label>Typ</label>
                  <select v-model="block.angle_type">
                    <option value="measure">Messen</option>
                    <option value="draw">Zeichnen</option>
                    <option value="calculate">Berechnen</option>
                    <option value="identify">Erkennen</option>
                  </select>
                </div>
              </div>
            </template>

            <!-- Word Problem -->
            <template v-if="block.type === 'word_problem'">
              <div class="form-group">
                <label>Problem</label>
                <textarea v-model="block.problem_text" rows="2" placeholder="Problem description..." @input="autoExpand($event)"></textarea>
              </div>
              <div
                v-for="(step, si) in block.steps || []"
                :key="si"
                style="display:flex;gap:0.25rem;margin-top:0.25rem"
              >
                <input v-model="step.description" placeholder="Step" style="flex:1" />
                <input v-model="step.expected" placeholder="Expected" style="flex:1" />
                <button class="btn-sm btn-danger" @click="block.steps.splice(si, 1)">×</button>
              </div>
              <button class="btn-sm" @click="block.steps = [...(block.steps || []), { description: '', expected: '' }]" style="margin-top:0.25rem">+ Step</button>
              <div class="form-group" style="margin-top:0.35rem">
                <label>Final Answer</label>
                <input v-model="block.final_answer" placeholder="Final answer" />
              </div>
            </template>

            <!-- Media / Audio / Video -->
            <template v-if="block.type === 'media' || block.type === 'audio' || block.type === 'video'">
              <div style="display:flex;gap:0.5rem;align-items:center">
                <input
                  v-model="block.src"
                  :placeholder="block.type === 'media' ? 'Image URL' : block.type === 'audio' ? 'Audio URL (.mp3)' : 'Video URL (.mp4)'"
                  style="flex:1"
                />
                <label class="btn-sm" style="cursor:pointer;margin:0;white-space:nowrap">
                  Upload
                  <input type="file" :accept="block.type === 'media' ? 'image/*' : block.type === 'audio' ? 'audio/*' : 'video/*'" style="display:none" @change="uploadFile($event, block)" />
                </label>
              </div>
              <div class="form-group" style="margin-top:0.35rem">
                <label>Caption (optional)</label>
                <input v-model="block.caption" placeholder="Caption" />
              </div>
              <div v-if="block.src" style="margin-top:0.5rem">
                <img v-if="block.type === 'media'" :src="block.src" style="max-width:100%;max-height:200px;border-radius:4px" />
                <audio v-else-if="block.type === 'audio'" controls style="width:100%">
                  <source :src="block.src" :type="block.mime_type || inferMimeType(block.src, 'audio')" />
                </audio>
                <video v-else controls style="max-width:100%;max-height:200px;border-radius:4px">
                  <source :src="block.src" :type="block.mime_type || inferMimeType(block.src, 'video')" />
                </video>
              </div>
            </template>

            <!-- YouTube -->
            <template v-if="block.type === 'youtube'">
              <div class="form-group">
                <label>YouTube URL</label>
                <input v-model="block.src" placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)" />
              </div>
              <div v-if="block.src && isYoutube(block.src)" style="margin-top:0.5rem;position:relative;padding-bottom:56.25%;height:0">
                <iframe :src="youtubeEmbed(block.src)" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:4px" frameborder="0" allowfullscreen></iframe>
              </div>
            </template>

            <!-- Drawing -->
            <template v-if="block.type === 'drawing'">
              <div class="form-group">
                <label>Drawing Prompt / Instructions</label>
                <textarea v-model="block.text" rows="2" placeholder="Describe what to draw..." @input="autoExpand($event)"></textarea>
              </div>
              <div style="display:flex;gap:0.5rem">
                <div class="form-group" style="flex:1">
                  <label>Canvas Width</label>
                  <input v-model.number="block.canvas_width" type="number" min="100" />
                </div>
                <div class="form-group" style="flex:1">
                  <label>Canvas Height</label>
                  <input v-model.number="block.canvas_height" type="number" min="100" />
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label>Background Image URL (optional)</label>
                <input v-model="block.background_image" placeholder="https://..." />
              </div>
            </template>

            <!-- Mermaid (common to all blocks) -->
            <details style="margin-top:0.75rem;font-size:0.8rem">
              <summary>+ Mermaid Diagram</summary>
              <textarea
                v-model="block.mermaid"
                rows="3"
                placeholder="graph TD; A[Concept] --> B[Outcome]"
                style="font-family:monospace;font-size:0.75rem;margin-top:0.25rem"
              ></textarea>
              <input v-model="block.alt_text" placeholder="Alt text" style="margin-top:0.25rem" />
            </details>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import { useUiStore } from '../stores/ui'
import { api } from '../services/api'

const route = useRoute()
const router = useRouter()
const store = useWorksheetsStore()
const uiStore = useUiStore()

const emptyForm = () => ({ title: '', subject: '', grade_level: '', description: '' })

const isEditing = ref(false)
const blocks = ref([])
const form = ref(emptyForm())
const subjects = ref([])
const gradeLevels = ref([])
const aiPrompt = ref('')
const aiLernziele = ref('')
const aiDifficulty = ref('medium')
const aiLength = ref('medium')
const aiProvider = ref('gemini')
const aiStyle = ref('practice')
const aiLoading = ref(false)
const conceptInput = ref('')
const differentiateLoading = ref(false)
const differentiatedConcept = ref(null)
const versionHistory = ref([])
const versionLoading = ref(false)
const aiPanelOpen = ref(false)
const titlePanelOpen = ref(false)
const versionPanelOpen = ref(true)

const lernzieleTemplates = computed(() => {
  const s = form.value.subject
  const map = {
    'Mathematik': [
      'Die Schüler/innen können Brüche addieren und subtrahieren.',
      'Die Schüler/innen können Gleichungen mit einer Unbekannten lösen.',
      'Die Schüler/innen können Flächen und Umfänge berechnen.',
      'Die Schüler/innen können Prozentrechnung anwenden.',
      'Die Schüler/innen können Dezimalzahlen multiplizieren und dividieren.',
      'Die Schüler/innen können Dreisatz-Aufgaben lösen.',
      'Die Schüler/innen können Winkel messen und benennen.',
      'Die Schüler/innen können statistische Daten auswerten.',
      'Die Schüler/innen können Potenzen und Wurzeln berechnen.',
      'Die Schüler/innen können lineare Funktionen darstellen.',
    ],
    'Deutsch': [
      'Die Schüler/innen können einen Text sinnerfassend lesen.',
      'Die Schüler/innen können Satzglieder bestimmen.',
      'Die Schüler/innen können Rechtschreibregeln anwenden.',
      'Die Schüler/innen können einen Aufsatz strukturiert verfassen.',
      'Die Schüler/innen können Wortarten erkennen und benennen.',
      'Die Schüler/innen können direkte und indirekte Rede unterscheiden.',
      'Die Schüler/innen können Texte zusammenfassen.',
      'Die Schüler/innen können Groß- und Kleinschreibung korrekt anwenden.',
      'Die Schüler/innen können Kommaregeln anwenden.',
      'Die Schüler/innen können Metaphern und Stilmittel erkennen.',
    ],
    'Englisch': [
      'Students can use the simple past tense correctly.',
      'Students can describe people and places using adjectives.',
      'Students can understand and answer questions about a text.',
      'Students can use modal verbs (can, must, should).',
      'Students can write a short informal letter or email.',
      'Students can use the present perfect tense.',
      'Students can talk about future plans using will/going to.',
      'Students can use conditional sentences (if-clauses type 1).',
      'Students can expand their vocabulary on the topic of daily life.',
      'Students can use passive voice in simple sentences.',
    ],
    'Geschichte': [
      'Die Schüler/innen können wichtige Ereignisse der Weltgeschichte einordnen.',
      'Die Schüler/innen können historische Quellen analysieren.',
      'Die Schüler/innen können Ursachen und Folgen historischer Ereignisse erklären.',
      'Die Schüler/innen können die Entwicklung der Demokratie beschreiben.',
      'Die Schüler/innen können das Leben im Mittelalter beschreiben.',
      'Die Schüler/innen können die Ursachen des Ersten Weltkriegs nennen.',
      'Die Schüler/innen können den Nationalsozialismus kritisch reflektieren.',
      'Die Schüler/innen können die Bedeutung der Französischen Revolution erklären.',
    ],
    'Geographie': [
      'Die Schüler/innen können Klimazonen der Erde beschreiben.',
      'Die Schüler/innen können Karten lesen und interpretieren.',
      'Die Schüler/innen können Naturkatastrophen erklären.',
      'Die Schüler/innen können wirtschaftliche Unterschiede zwischen Ländern erklären.',
      'Die Schüler/innen können den Wasserkreislauf beschreiben.',
      'Die Schüler/innen können Bevölkerungsentwicklung analysieren.',
      'Die Schüler/innen können Gebirgsbildung und Plattentektonik erklären.',
    ],
    'Biologie': [
      'Die Schüler/innen können den Aufbau der Zelle beschreiben.',
      'Die Schüler/innen können Fotosynthese und Zellatmung erklären.',
      'Die Schüler/innen können Ökosysteme und Nahrungsketten beschreiben.',
      'Die Schüler/innen können die Vererbungslehre anwenden.',
      'Die Schüler/innen können den menschlichen Körper und seine Organe benennen.',
      'Die Schüler/innen können Evolution und natürliche Selektion erklären.',
      'Die Schüler/innen können Wirbeltiere und Wirbellose unterscheiden.',
    ],
    'Physik': [
      'Die Schüler/innen können das Ohmsche Gesetz anwenden.',
      'Die Schüler/innen können Kräfte und Bewegungen beschreiben.',
      'Die Schüler/innen können Energieformen und Energieumwandlung erklären.',
      'Die Schüler/innen können einfache Stromkreise zeichnen.',
      'Die Schüler/innen können Aggregatzustände und Wärmeübertragung erklären.',
      'Die Schüler/innen können Schall und Licht als Wellenphänomene beschreiben.',
      'Die Schüler/innen können Hebelgesetze anwenden.',
    ],
    'Chemie': [
      'Die Schüler/innen können das Periodensystem lesen.',
      'Die Schüler/innen können chemische Reaktionsgleichungen aufstellen.',
      'Die Schüler/innen können Säuren und Basen unterscheiden.',
      'Die Schüler/innen können Atombau und Elektronenkonfiguration beschreiben.',
      'Die Schüler/innen können organische Verbindungen benennen.',
      'Die Schüler/innen können Oxidation und Reduktion erklären.',
    ],
    'Informatik': [
      'Die Schüler/innen können einfache Algorithmen beschreiben.',
      'Die Schüler/innen können Variablen und Schleifen in einer Programmiersprache verwenden.',
      'Die Schüler/innen können Daten in Tabellen und Datenbanken organisieren.',
      'Die Schüler/innen können Datenschutz und Datensicherheit erklären.',
      'Die Schüler/innen können Binärzahlen umrechnen.',
    ],
    'Musik': [
      'Die Schüler/innen können Noten lesen und schreiben.',
      'Die Schüler/innen können Musikstile und Epochen unterscheiden.',
      'Die Schüler/innen können Rhythmus und Takt erkennen.',
      'Die Schüler/innen können Instrumente der Orchester benennen.',
    ],
    'Kunst': [
      'Die Schüler/innen können Farbenlehre und Farbmischung anwenden.',
      'Die Schüler/innen können Perspektive in Zeichnungen darstellen.',
      'Die Schüler/innen können Kunststile und Epochen beschreiben.',
      'Die Schüler/innen können eigene kreative Werke gestalten.',
    ],
    'Sport': [
      'Die Schüler/innen können Spielregeln erklären und anwenden.',
      'Die Schüler/innen können Aufwärm- und Dehnübungen durchführen.',
      'Die Schüler/innen können fair play und Teamarbeit demonstrieren.',
    ],
    'Ethik': [
      'Die Schüler/innen können ethische Dilemmata analysieren.',
      'Die Schüler/innen können verschiedene Wertvorstellungen vergleichen.',
      'Die Schüler/innen können Menschenrechte benennen und erklären.',
    ],
    'Religion': [
      'Die Schüler/innen können Weltreligionen vergleichen.',
      'Die Schüler/innen können religiöse Feste und Bräuche beschreiben.',
      'Die Schüler/innen können biblische Texte interpretieren.',
    ],
  }
  return map[s] || []
})

const blockIcons = {
  text: '📄',
  read_aloud: '🔊',
  gap_fill: '✏️',
  multiple_choice: '✅',
  single_choice: '☑️',
  short_answer: '📝',
  matching: '🔗',
  word_scramble: '🔤',
  arithmetic_grid: '➕',
  equation_entry: '=️⃣',
  fraction_input: '🧮',
  number_line: '📏',
  word_problem: '📖',
  graph_plot: '📊',
  geometry_shape: '🔷',
  percentage: '💯',
  unit_conversion: '🔄',
  angle: '📐',
  media: '🖼️',
  audio: '🎵',
  video: '🎬',
  youtube: '📺',
  info_box: '💡',
  true_false: '⚖️',
  ordering: '🔢',
  drawing: '🎨',
  fraction_model: '🍕',
}

const germanBlockLabel = {
  arithmetic_grid: 'Grundrechnung',
  equation_entry: 'Gleichung',
  fraction_input: 'Bruch',
  number_line: 'Zahlenstrahl',
  word_problem: 'Textaufgabe',
  graph_plot: 'Diagramm',
  geometry_shape: 'Geometrie',
  percentage: 'Prozent',
  unit_conversion: 'Einheiten',
  angle: 'Winkel',
  fraction_model: 'Bruchbild',
}

const differentiateTemplates = computed(() => {
  const s = form.value.subject
  const map = {
    'Mathematik': [
      'Brüche', 'Gleichungen', 'Prozentrechnung', 'Flächenberechnung', 'Dreisatz',
      'Dezimalzahlen', 'Potenzen', 'Lineare Funktionen', 'Statistik', 'Geometrie',
    ],
    'Deutsch': [
      'Satzglieder', 'Wortarten', 'Rechtschreibung', 'Aufsatz schreiben',
      'Direkte Rede', 'Kommaregeln', 'Textanalyse', 'Stilmittel',
    ],
    'Englisch': [
      'Simple Past', 'Present Perfect', 'Modal verbs', 'Passive voice',
      'Conditional sentences', 'Reported speech', 'Adjectives and adverbs',
    ],
    'Geschichte': [
      'Erster Weltkrieg', 'Zweiter Weltkrieg', 'Nationalsozialismus',
      'Französische Revolution', 'Mittelalter', 'Antikes Rom', 'Demokratie',
    ],
    'Geographie': [
      'Klimazonen', 'Plattentektonik', 'Wasserkreislauf', 'Bevölkerungsentwicklung',
      'Wirtschaftsräume', 'Naturkatastrophen',
    ],
    'Biologie': [
      'Zellaufbau', 'Fotosynthese', 'Ökosystem', 'Vererbung', 'Evolution',
      'Menschlicher Körper', 'Nahrungskette',
    ],
    'Physik': [
      'Ohmsches Gesetz', 'Kräfte und Bewegung', 'Energieumwandlung',
      'Stromkreis', 'Wärmelehre', 'Optik', 'Hebelgesetz',
    ],
    'Chemie': [
      'Periodensystem', 'Säuren und Basen', 'Atombau', 'Reaktionsgleichungen',
      'Oxidation und Reduktion', 'Organische Chemie',
    ],
    'Informatik': [
      'Algorithmen', 'Variablen und Schleifen', 'Datenbanken',
      'Datenschutz', 'Binärsystem',
    ],
    'Musik': ['Noten lesen', 'Rhythmus', 'Musikepochen', 'Instrumente'],
    'Kunst': ['Farbenlehre', 'Perspektive', 'Kunststile'],
    'Ethik': ['Ethische Dilemmata', 'Menschenrechte', 'Wertvorstellungen'],
    'Religion': ['Weltreligionen', 'Religiöse Feste', 'Biblische Texte'],
    'Sport': ['Spielregeln', 'Aufwärmen', 'Fair Play'],
  }
  return map[s] || []
})

function getRouteWorksheetId() {
  if (!route.params.id) return null
  return Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
}

function mapLoadedBlocks(rawBlocks) {
  return (rawBlocks || []).map((block) => {
    const loaded = { ...block }
    loaded.text = loaded.text || ''
    if (loaded.type === 'short_answer') {
      loaded.keywordsStr = loaded.keywords ? loaded.keywords.join(', ') : ''
    }
    if (loaded.type === 'graph_plot') {
      loaded.pointsStr = JSON.stringify(loaded.points_to_plot || [])
    }
    if (loaded.type === 'number_line') {
      loaded.min_value = loaded.min_value ?? 0
      loaded.max_value = loaded.max_value ?? 100
      loaded.markers = loaded.markers ?? [50]
    }
    if (loaded.type === 'equation_entry') {
      loaded.equation = loaded.equation || ''
      loaded.final_answer = loaded.final_answer || ''
    }
    if (loaded.type === 'fraction_input') {
      loaded.numerator = loaded.numerator ?? 1
      loaded.denominator = loaded.denominator ?? 2
    }
    if (loaded.type === 'fraction_model') {
      loaded.numerator = loaded.numerator ?? 3
      loaded.denominator = loaded.denominator ?? 4
      loaded.model_type = loaded.model_type || 'circle'
      loaded.show_labels = loaded.show_labels ?? true
    }
    if (loaded.type === 'arithmetic_grid') {
      loaded.operand1 = loaded.operand1 ?? 0
      loaded.operand2 = loaded.operand2 ?? 0
      loaded.operation = loaded.operation || 'add'
    }
    if (loaded.type === 'geometry_shape') {
      loaded.shape_type = loaded.shape_type || 'triangle'
    }
    if (loaded.type === 'word_problem') {
      loaded.problem_text = loaded.problem_text || ''
      loaded.steps = loaded.steps || [{ description: '', expected: '' }]
      loaded.final_answer = loaded.final_answer || ''
    }
    if (loaded.type === 'matching') {
      loaded.pairs = loaded.pairs || [
        ['', ''],
        ['', ''],
      ]
    }
    if (loaded.type === 'multiple_choice' || loaded.type === 'single_choice') {
      loaded.options = loaded.options || ['', '', '']
      loaded.correct =
        loaded.type === 'single_choice' ? (loaded.correct ?? 0) : loaded.correct || []
    }
    if (loaded.type === 'true_false') {
      loaded.correct_answer = loaded.correct_answer ?? true
    }
    if (loaded.type === 'ordering') {
      loaded.items = loaded.items || ['', '', '']
    }
    if (loaded.type === 'percentage') {
      loaded.percentage_value = loaded.percentage_value ?? 20
      loaded.part_value = loaded.part_value ?? 10
      loaded.whole_value = loaded.whole_value ?? 50
    }
    if (loaded.type === 'unit_conversion') {
      loaded.value = loaded.value ?? 150
      loaded.from_unit = loaded.from_unit ?? 'cm'
      loaded.to_unit = loaded.to_unit ?? 'm'
    }
    if (loaded.type === 'angle') {
      loaded.expected_degrees = loaded.expected_degrees ?? 90
      loaded.angle_type = loaded.angle_type ?? 'identify'
    }
    if (loaded.type === 'drawing') {
      loaded.canvas_width = loaded.canvas_width ?? 600
      loaded.canvas_height = loaded.canvas_height ?? 400
      loaded.background_image = loaded.background_image ?? ''
    }
    return loaded
  })
}

async function syncBuilderToRoute() {
  const worksheetId = getRouteWorksheetId()
  if (!worksheetId) {
    isEditing.value = false
    form.value = emptyForm()
    blocks.value = []
    versionHistory.value = []
    return
  }
  isEditing.value = true
  try {
    await store.fetchWorksheet(worksheetId)
    if (!store.current) {
      form.value = emptyForm()
      blocks.value = []
      isEditing.value = false
      return
    }
    form.value = {
      title: store.current.title || '',
      subject: store.current.subject || '',
      grade_level: store.current.grade_level || '',
      description: store.current.description || '',
    }
    try {
      const content = JSON.parse(store.current.content || '{}')
      blocks.value = mapLoadedBlocks(content.blocks)
    } catch {
      blocks.value = []
    }
    await loadVersions()
  } catch {
    uiStore.showToast('Failed to load worksheet', 'error')
    resetBuilder()
  }
}

onMounted(async () => {
  try {
    const [subData, gradeData] = await Promise.all([
      api.get('/worksheets/subjects'),
      api.get('/worksheets/grade-levels'),
    ])
    subjects.value = subData.subjects || []
    gradeLevels.value = gradeData.gradeLevels || []
  } catch {
    /* */
  }
  await syncBuilderToRoute()
})

watch(
  () => route.fullPath,
  () => {
    syncBuilderToRoute()
  },
)

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
}

function tryParsePoints(block) {
  try {
    block.points_to_plot = JSON.parse(block.pointsStr)
  } catch {
    /* */
  }
}

function autoExpand(event) {
  const target = event && event.target
  if (!target) return
  target.style.height = 'auto'
  target.style.height = `${target.scrollHeight}px`
}

function inferMimeType(src, kind) {
  const normalized = String(src || '').toLowerCase()
  if (kind === 'audio') {
    if (normalized.endsWith('.mp3')) return 'audio/mpeg'
    if (normalized.endsWith('.wav')) return 'audio/wav'
    if (normalized.endsWith('.ogg')) return 'audio/ogg'
    if (normalized.endsWith('.m4a')) return 'audio/mp4'
    return 'audio/mpeg'
  }

  if (normalized.endsWith('.webm')) return 'video/webm'
  if (normalized.endsWith('.mov')) return 'video/quicktime'
  return 'video/mp4'
}

/* ---- Fraction model SVG helpers ---- */
function fractionIndices(block) {
  const n = Math.max(1, Math.min(block.denominator || 1, 20))
  return Array.from({ length: n }, (_, i) => i)
}

function fractionViewBox(block) {
  return block.model_type === 'circle' ? '0 0 200 200' : '0 0 240 90'
}

function fractionSvgWidth(block) {
  return block.model_type === 'circle' ? 180 : 240
}

function fractionSvgHeight(block) {
  return block.model_type === 'circle' ? 180 : 90
}

function fractionSlicePath(index, block) {
  const n = Math.max(1, Math.min(block.denominator || 1, 20))
  if (n === 0) return ''
  const cx = 100, cy = 100, r = 95
  const angle = (2 * Math.PI) / n
  const startAngle = angle * index - Math.PI / 2
  const endAngle = startAngle + angle
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  const largeArc = angle > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
}

function canAiRegenerate(type) {
  return !['media', 'audio', 'video', 'youtube', 'drawing'].includes(type)
}

function addBlock(type) {
  const block = {
    id: genId(),
    type,
    points:
      type === 'media' ||
      type === 'audio' ||
      type === 'video' ||
      type === 'youtube' ||
      type === 'text' ||
      type === 'read_aloud' ||
      type === 'drawing'
        ? 0
        : 10,
    text: '',
  }
  if (type === 'gap_fill') block.template = ''
  if (type === 'multiple_choice' || type === 'single_choice') {
    block.options = ['', '', '']
    block.correct = type === 'single_choice' ? 0 : []
  }
  if (type === 'matching')
    block.pairs = [
      ['', ''],
      ['', ''],
    ]
  if (type === 'short_answer') {
    block.sample_answer = ''
    block.keywordsStr = ''
  }
  if (type === 'word_scramble') block.words = [{ word: '' }, { word: '' }]
  if (type === 'number_line') {
    block.min_value = 0
    block.max_value = 100
    block.markers = [50]
  }
  if (type === 'equation_entry') {
    block.equation = ''
    block.final_answer = ''
  }
  if (type === 'fraction_input') {
    block.numerator = 1
    block.denominator = 2
  }
  if (type === 'fraction_model') {
    block.points = 0
    block.numerator = 3
    block.denominator = 4
    block.model_type = 'circle'
    block.show_labels = true
  }
  if (type === 'arithmetic_grid') {
    block.operand1 = 23
    block.operand2 = 15
    block.operation = 'add'
  }
  if (type === 'graph_plot') {
    block.points_to_plot = [[0, 0]]
    block.pointsStr = '[[0,0]]'
  }
  if (type === 'percentage') {
    block.percentage_value = 20
    block.part_value = 10
    block.whole_value = 50
  }
  if (type === 'unit_conversion') {
    block.points = 6
    block.value = 150
    block.from_unit = 'cm'
    block.to_unit = 'm'
  }
  if (type === 'angle') {
    block.points = 6
    block.expected_degrees = 90
    block.angle_type = 'identify'
  }
  if (type === 'geometry_shape') block.shape_type = 'triangle'
  if (type === 'word_problem') {
    block.problem_text = ''
    block.steps = [{ description: '', expected: '' }]
    block.final_answer = ''
  }
  if (type === 'info_box') {
    block.points = 0
    block.title = 'Click to learn more'
    block.text = 'Your explanation here...'
    block.mermaid = ''
    block.alt_text = ''
  }
  if (type === 'media' || type === 'audio' || type === 'video' || type === 'youtube') {
    block.src = ''
    block.caption = ''
  }
  if (type === 'true_false') {
    block.correct_answer = true
  }
  if (type === 'ordering') {
    block.items = ['', '', '']
  }
  if (type === 'drawing') {
    block.canvas_width = 600
    block.canvas_height = 400
    block.background_image = ''
  }
  blocks.value.push(block)
}

function removeBlock(idx) {
  blocks.value.splice(idx, 1)
}

function moveBlock(idx, delta) {
  const newIdx = idx + delta
  ;[blocks.value[idx], blocks.value[newIdx]] = [blocks.value[newIdx], blocks.value[idx]]
}

function resetBuilder() {
  isEditing.value = false
  form.value = emptyForm()
  blocks.value = []
  versionHistory.value = []
  differentiatedConcept.value = null
  conceptInput.value = ''
}

async function loadVersions() {
  const worksheetId = getRouteWorksheetId()
  if (!worksheetId) return
  versionLoading.value = true
  try {
    versionHistory.value = await store.fetchWorksheetVersions(worksheetId)
  } catch {
    versionHistory.value = []
  } finally {
    versionLoading.value = false
  }
}

function formatVersionDate(value) {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString()
}

async function restoreVersion(versionId) {
  const worksheetId = getRouteWorksheetId()
  if (!worksheetId) return
  if (!confirm('Restore this worksheet version? Current content will be replaced.')) return
  try {
    await store.restoreWorksheetVersion(worksheetId, versionId)
    await syncBuilderToRoute()
    uiStore.showToast('Worksheet version restored', 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to restore version', 'error')
  }
}

async function differentiateConcept() {
  if (!conceptInput.value.trim()) return
  if (!form.value.subject || !form.value.grade_level) {
    uiStore.showToast('Please select subject and grade level first', 'error')
    return
  }
  differentiateLoading.value = true
  try {
    differentiatedConcept.value = await store.aiDifferentiateConcept({
      concept: conceptInput.value.trim(),
      subject: form.value.subject,
      grade_level: form.value.grade_level,
      provider: aiProvider.value,
    })
    uiStore.showToast('Differentiated explanations ready', 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to differentiate concept', 'error')
  } finally {
    differentiateLoading.value = false
  }
}

function insertDifferentiatedInfoBox() {
  if (!differentiatedConcept.value) return
  blocks.value.unshift({
    id: genId(),
    type: 'info_box',
    points: 0,
    title: conceptInput.value.trim() || 'Differentiated concept support',
    text: `Basic:\n${differentiatedConcept.value.basic}\n\nStandard:\n${differentiatedConcept.value.standard}\n\nAdvanced:\n${differentiatedConcept.value.advanced}`,
    mermaid: '',
    alt_text: '',
  })
  uiStore.showToast('Info box added', 'success')
}

async function save() {
  const worksheetId = getRouteWorksheetId()
  const mappedBlocks = blocks.value.map((b) => {
    const copy = { ...b }
    if (copy.type === 'short_answer') {
      copy.keywords = (copy.keywordsStr || '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    }
    return copy
  })
  const content = JSON.stringify({ blocks: mappedBlocks })
  const totalPoints = blocks.value.reduce((s, b) => s + (b.points || 0), 0)
  const payload = {
    ...form.value,
    content,
    total_points: totalPoints,
    change_summary: isEditing.value ? 'Updated from worksheet builder' : 'Initial version',
  }
  try {
    if (isEditing.value && worksheetId) {
      await store.updateWorksheet(worksheetId, payload)
      await loadVersions()
    } else {
      const ws = await store.createWorksheet(payload)
      router.push(`/teacher/builder/${ws.id}`)
    }
    uiStore.showToast('Saved', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function generateAI() {
  if (!aiPrompt.value.trim()) return
  if (!form.value.subject || !form.value.grade_level) {
    uiStore.showToast('Please select subject and grade level first', 'error')
    return
  }
  aiLoading.value = true
  try {
    const data = await store.aiGenerate(aiPrompt.value, aiProvider.value, {
      difficulty: aiDifficulty.value,
      length: aiLength.value,
      lernziele: aiLernziele.value.trim() || undefined,
      subject: form.value.subject,
      grade_level: form.value.grade_level,
      title: form.value.title || undefined,
      description: form.value.description || undefined,
      style: aiStyle.value,
    })
    blocks.value.push(...mapLoadedBlocks(data.blocks))
    uiStore.showToast(`Generated ${data.blocks.length} blocks`, 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    aiLoading.value = false
  }
}

async function sidebarGenerate() {
  await generateAI()
}

async function regenerateBlock(idx) {
  const block = blocks.value[idx]
  if (!block) return
  if (!canAiRegenerate(block.type)) {
    uiStore.showToast('AI regenerate is not available for uploaded media blocks', 'error')
    return
  }
  aiLoading.value = true
  try {
    const data = await store.aiRegenerateBlock({
      blockType: block.type,
      prompt: aiPrompt.value || undefined,
      currentBlock: block,
      worksheetContext: {
        title: form.value.title || undefined,
        description: form.value.description || undefined,
        previousBlock: idx > 0 ? blocks.value[idx - 1] : undefined,
        nextBlock: idx < blocks.value.length - 1 ? blocks.value[idx + 1] : undefined,
      },
      provider: aiProvider.value,
      difficulty: aiDifficulty.value,
      subject: form.value.subject || undefined,
      grade_level: form.value.grade_level || undefined,
      lernziele: aiLernziele.value.trim() || undefined,
      style: aiStyle.value,
    })
    const mapped = mapLoadedBlocks([data.block])[0]
    blocks.value[idx] = { ...blocks.value[idx], ...mapped }
    uiStore.showToast(`Block "${block.type}" regenerated`, 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to regenerate block', 'error')
  } finally {
    aiLoading.value = false
  }
}

async function regenerateBlockWithInstruction(idx, instruction) {
  const block = blocks.value[idx]
  if (!block) return
  if (!canAiRegenerate(block.type)) {
    uiStore.showToast('AI regenerate is not available for uploaded media blocks', 'error')
    return
  }
  aiLoading.value = true
  try {
    const prompt = `${aiPrompt.value ? aiPrompt.value + '. ' : ''}Regenerate to be ${instruction}. ${block.text || block.template || ''}`
    const data = await store.aiRegenerateBlock({
      blockType: block.type,
      prompt,
      currentBlock: block,
      worksheetContext: {
        title: form.value.title || undefined,
        description: form.value.description || undefined,
        previousBlock: idx > 0 ? blocks.value[idx - 1] : undefined,
        nextBlock: idx < blocks.value.length - 1 ? blocks.value[idx + 1] : undefined,
      },
      provider: aiProvider.value,
      difficulty: instruction === 'easier' ? 'easy' : instruction === 'harder' ? 'hard' : aiDifficulty.value,
      subject: form.value.subject || undefined,
      grade_level: form.value.grade_level || undefined,
      lernziele: aiLernziele.value.trim() || undefined,
      style: aiStyle.value,
    })
    const mapped = mapLoadedBlocks([data.block])[0]
    blocks.value[idx] = { ...blocks.value[idx], ...mapped }
    uiStore.showToast(`Block made ${instruction}`, 'success')
  } catch (e) {
    uiStore.showToast(e.message || 'Failed to regenerate block', 'error')
  } finally {
    aiLoading.value = false
  }
}

function isYoutube(url) {
  return /youtube\.com|youtu\.be/.test(url)
}
function youtubeEmbed(url) {
  const id = url.match(/(?:v=|\/)([\w-]{11})/)
  return id ? `https://www.youtube.com/embed/${id[1]}` : ''
}

async function uploadFile(event, block) {
  const file = event.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  try {
    const data = await api.upload('/media/upload', formData)
    block.src = data.media.url
    block.mime_type = data.media.mime_type
    uiStore.showToast('Uploaded', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}
</script>

<style scoped>
/* ===== Builder Page Layout ===== */
.builder-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2.5rem;
}

.builder-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

/* ===== Left Sidebar ===== */
.builder-sidebar {
  width: 300px;
  min-width: 300px;
  position: sticky;
  top: calc(4.5rem);
  max-height: calc(100vh - 5.5rem);
  overflow-y: auto;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-right: 0.25rem;
}

.builder-sidebar::-webkit-scrollbar {
  width: 3px;
}

/* Sidebar header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sidebar-header-title h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

/* Sidebar card (settings) */
.sidebar-card {
  padding: 0.85rem;
}

.sidebar-card .form-group label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}

.sidebar-card input,
.sidebar-card textarea,
.sidebar-card select {
  font-size: 0.78rem;
  padding: 0.35rem 0.5rem;
}

/* Sidebar sections */
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.sidebar-heading {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0;
  padding: 0 0.15rem;
}

/* Block toolbar grid */
.block-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
}

.block-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.32rem 0.4rem;
  font-size: 0.68rem;
  font-weight: 500;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
}

.block-btn:hover {
  border-color: var(--primary-soft);
  background: var(--primary-light);
  color: var(--primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.block-btn:active {
  transform: translateY(0);
}

.block-btn-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}

/* Collapsible panels */
.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.4rem 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.collapse-toggle:hover {
  background: var(--bg-hover);
  border-color: var(--primary-soft);
  color: var(--primary);
}

.collapse-toggle-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.collapse-arrow {
  font-size: 0.65rem;
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.collapse-arrow.open {
  transform: rotate(180deg);
}

.collapse-content {
  padding: 0.45rem 0 0;
  display: flex;
  flex-direction: column;
}

/* ===== Right Main ===== */
.builder-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* Block cards */
.block-card {
  padding: 1rem;
  transition: all var(--transition);
  animation: fadeUp 0.25s ease both;
}

.block-card:hover {
  border-color: var(--primary-soft);
  box-shadow: var(--shadow-md);
}

/* Block card header */
.block-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.block-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.block-type-icon {
  font-size: 1.15rem;
  flex-shrink: 0;
}

.block-card-title strong {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: capitalize;
  letter-spacing: 0.01em;
}

.block-card-controls {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.pts-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
  display: inline;
}

.pts-input {
  width: 52px;
  font-size: 0.72rem !important;
  padding: 0.2rem 0.35rem !important;
  text-align: center;
}

/* AI regenerate toolbar */
.block-ai-toolbar {
  display: flex;
  gap: 0.3rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
}

/* Block card body */
.block-card-body {
  font-size: 0.82rem;
}

.block-card-body .form-group {
  margin-bottom: 0.5rem;
}

.block-card-body label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}

.block-card-body input,
.block-card-body textarea,
.block-card-body select {
  font-size: 0.8rem;
  padding: 0.4rem 0.55rem;
}

/* Details/summary (Mermaid) */
.block-card-body details {
  margin-top: 0.6rem;
}

.block-card-body details summary {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.block-card-body details summary:hover {
  color: var(--primary);
}

/* Animation for block cards */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Empty state */
.builder-main .empty-state p {
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* Responsive: stack on narrow screens */
@media (max-width: 900px) {
  .builder-layout {
    flex-direction: column;
  }
  .builder-sidebar {
    width: 100%;
    min-width: 100%;
    position: static;
    max-height: none;
  }
}
</style>
