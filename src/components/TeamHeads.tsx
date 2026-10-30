import { STAFF, teamLine, type StaffRole } from '../data/team';
import './TeamHeads.css';

/**
 * The people who meet the guest, as small round photos. Not a button: the details are in the
 * programme («Узнать больше»). `row` — overlapping heads and one line (cards, the comparison);
 * `list` — each person with the role and what they do (the programme window, step 1).
 */
export function TeamHeads({
  roles,
  variant = 'row',
  size = 44,
}: {
  roles: StaffRole[];
  variant?: 'row' | 'list';
  size?: number;
}) {
  if (!roles.length) return null;
  if (variant === 'list')
    return (
      <ul className="team-list">
        {roles.map((r) => (
          <li key={r}>
            <img src={STAFF[r].img} alt="" width={size} height={size} />
            <span>
              <strong>{STAFF[r].role}</strong>
              <span>{STAFF[r].d}</span>
            </span>
          </li>
        ))}
      </ul>
    );
  const line = teamLine(roles);
  return (
    <div className="team-row" aria-label={'В санатории: ' + roles.map((r) => STAFF[r].role.toLowerCase()).join(', ')}>
      <span className="team-heads" style={{ ['--th' as string]: size + 'px' }} aria-hidden="true">
        {roles.map((r) => (
          <img key={r} src={STAFF[r].img} alt="" width={size} height={size} />
        ))}
      </span>
      <span className="team-t">
        <strong>{line.t}</strong>
        <span>{line.s}</span>
      </span>
    </div>
  );
}
