import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '@/components/layout/ScreenHeader';

type TrendsHeaderProps = {
  onBack: () => void;
};

export function TrendsHeader({ onBack }: TrendsHeaderProps) {
  const { t } = useTranslation();
  return (
    <ScreenHeader
      title={t('trends.title')}
      subtitle={t('trends.window')}
      onBack={onBack}
    />
  );
}
