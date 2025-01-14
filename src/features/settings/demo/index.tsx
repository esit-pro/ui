import ContentSection from '../components/content-section'
import { DemoSettings } from "./demo-settings";

export default function SettingsDemo() {
  return (
    <ContentSection
      title="Demo Data"
      desc="Manage demo data in your application. Use this section to clear demo content when needed."
    >
      <DemoSettings />
    </ContentSection>
  );
}
