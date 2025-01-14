import { createFileRoute } from '@tanstack/react-router';
import DemoSettingsPage from '@/features/settings/demo';

export const Route = createFileRoute('/_authenticated/settings/demo')({
  component: DemoSettingsPage,
});
