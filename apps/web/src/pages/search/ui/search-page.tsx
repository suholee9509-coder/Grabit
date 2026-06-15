import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import { SearchDiscovery } from '@/widgets/search-discovery';
import { SearchResults } from '@/widgets/search-results';
import { useContentSearch } from '@/features/content-search';
import styles from './search-page.module.css';

/**
 * SearchPage — 검색 화면 호스트(앱 셸 + Sidebar activeMenu="search" + Topbar).
 *   useContentSearch 상태 → mode 분기: discovery(검색전) / results·empty·loading·error(검색후).
 *   카드 클릭 → /content/:id(u4 스텁). GNB는 검색 활성만(구조 변경 ❌).
 */
export function SearchPage() {
  const navigate = useNavigate();
  const search = useContentSearch();

  const goContent = (id: string) => navigate(`/content/${id}`);

  return (
    <AppShell
      sidebar={
        <Sidebar
          activeMenu="search"
          onMenuSelect={(key) => {
            if (key === 'home') navigate('/');
            else if (key === 'search') navigate('/search');
          }}
          profile={{ name: 'Grabit 사용자' }}
        />
      }
      topbar={<Topbar />}
    >
      <div className={styles.body}>
        {search.mode === 'discovery' ? (
          <SearchDiscovery
            input={search.input}
            onInputChange={search.setInput}
            onSubmit={search.submit}
            category={search.category}
            onCategorySelect={search.setCategory}
            recent={search.recent.recent}
            onRecentSelect={search.submit}
            onRecentRemove={search.recent.remove}
            onCardSelect={goContent}
          />
        ) : (
          <SearchResults
            query={search.query}
            mode={search.mode}
            category={search.category}
            onCategorySelect={search.setCategory}
            source={search.source}
            onSourceSelect={search.setSource}
            sort={search.sort}
            onSortChange={search.setSort}
            results={search.results}
            sources={search.sources}
            onDismiss={search.dismiss}
            onCardSelect={goContent}
            onRetry={search.retry}
          />
        )}
      </div>
    </AppShell>
  );
}
