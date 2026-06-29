import { ANSWERED_QUESTIONS } from './elite-data';
import { AskQuestionForm } from './AskQuestionForm';

/**
 * Educator Q&A (M21). Two parts: the {@link AskQuestionForm} client leaf (stubbed
 * backend) and a server-rendered list of previously answered questions (sample
 * data). The submit form's backend is not wired; the answered list is static
 * until the Q&A table lands. Education-only copy throughout (PROJECT.md §6.7).
 */
export function EducatorQa() {
  return (
    <section className="el-qa" aria-labelledby="el-qa-h">
      <h2 id="el-qa-h" className="el-section-h">
        Educator Q&amp;A
      </h2>
      <p className="el-section-lead muted">
        Ask what the courses do not cover. Educators answer and add the best questions to this
        Elite-only library.
      </p>

      <div className="el-qa-grid">
        <div className="card card-pad el-qa-ask">
          <AskQuestionForm />
        </div>

        <div className="el-qa-answers">
          <h3 className="el-qa-answers-h">Recently answered</h3>
          <ul className="el-qa-list">
            {ANSWERED_QUESTIONS.map((item) => (
              <li className="el-qa-item" key={item.id}>
                <div className="el-qa-item-head">
                  <span className="chip chip-outline el-qa-topic">{item.topic}</span>
                  <span className="el-qa-on muted">{item.answeredOn}</span>
                </div>
                <p className="el-qa-q">{item.question}</p>
                <p className="el-qa-a muted">{item.answer}</p>
                <p className="el-qa-by">Answered by {item.answeredBy}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
