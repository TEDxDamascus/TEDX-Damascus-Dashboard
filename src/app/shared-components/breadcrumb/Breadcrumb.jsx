import { Link } from 'react-router-dom';
import { ChevronRight, Home } from '@mui/icons-material';

/**
 * items: [{ label: 'Forms', href: '/forms' }, { label: 'Submissions' }]
 * Last item (no href) is the current page — rendered as plain text.
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="mb-3 flex items-center gap-0.5 text-xs text-gray-400">
      <Link to="/" className="flex items-center transition-colors hover:text-tedx-red">
        <Home className="text-[14px]" />
      </Link>

      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-0.5">
          <ChevronRight className="text-[14px] text-gray-300" />
          {item.href ? (
            <Link to={item.href} className="font-medium transition-colors hover:text-tedx-red">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-600">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
