import { useNavigate } from 'react-router-dom';
import noSectionImg from '../../../assets/img/no-section.png';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <img src={noSectionImg} alt="Page not found" className="mb-8 w-40 opacity-80" />

      <h1 className="mb-2 text-6xl font-bold text-tedx-dark">404</h1>
      <p className="mb-1 text-xl font-semibold text-gray-700">Page not found</p>
      <p className="mb-8 text-sm text-gray-400">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>

      <button
        onClick={() => navigate(-1)}
        className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        Go back
      </button>
    </div>
  );
}
