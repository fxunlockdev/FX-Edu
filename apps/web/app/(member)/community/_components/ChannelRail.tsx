import { CHANNELS, type ChannelKey } from './community-data';

/**
 * Channel navigation rail. Channel switch is URL state (`?channel=`): each entry
 * is a plain `<a>` so it is server-rendered, shareable, and back-button friendly
 * (no client JS needed to change channels). The active channel reads from the
 * page's resolved `?channel=` param.
 */
export function ChannelRail({ active }: { active: ChannelKey }) {
  return (
    <nav className="cm-channels" aria-label="Community channels">
      <p className="cm-rail-title" id="cm-channels-title">
        Channels
      </p>
      <ul aria-labelledby="cm-channels-title">
        {CHANNELS.map((channel) => {
          const on = channel.key === active;
          const href = channel.key === 'general' ? '/community' : `/community?channel=${channel.key}`;
          return (
            <li key={channel.key}>
              <a
                className={`cm-channel${on ? ' is-active' : ''}`}
                href={href}
                aria-current={on ? 'page' : undefined}
              >
                <span className="cm-hash" aria-hidden="true">
                  #
                </span>
                {channel.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
