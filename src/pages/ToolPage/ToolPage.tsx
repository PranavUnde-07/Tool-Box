import { useParams } from 'react-router';
import { Clock, Wrench } from 'lucide-react';
import { ToolLayout } from '../../layouts/ToolLayout';
import { ToolWorkflow } from '../../components/ToolWorkflow';
import { QrTool } from '../../components/QrTool';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { tools } from '../../config/tools';
import { Link } from 'react-router';

export function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = tools.find((t) => t.id === slug);

  if (!tool) {
    return (
      <ToolLayout title="Tool Not Found" description="This tool does not exist.">
        <EmptyState
          icon={<Wrench size={32} />}
          title="Tool not found"
          description="The tool you are looking for does not exist. Please go back and select a valid tool."
          action={
            <Link to="/">
              <Button variant="primary" size="md">Go Home</Button>
            </Link>
          }
        />
      </ToolLayout>
    );
  }

  if (tool.status === 'coming-soon') {
    return (
      <ToolLayout title={tool.name} description={tool.description}>
        <EmptyState
          icon={<Clock size={32} />}
          title="Coming Soon"
          description={`${tool.name} is under development and will be available in a future update. Stay tuned.`}
          action={
            <Link to="/">
              <Button variant="secondary" size="md">Browse Available Tools</Button>
            </Link>
          }
        />
      </ToolLayout>
    );
  }

  if (tool.inputType === 'text') {
    return (
      <ToolLayout title={tool.name} description={tool.description}>
        <QrTool tool={tool} />
      </ToolLayout>
    );
  }

  return (
    <ToolLayout title={tool.name} description={tool.description}>
      <ToolWorkflow tool={tool} />
    </ToolLayout>
  );
}
