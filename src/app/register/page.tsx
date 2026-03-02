import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RegisterForm } from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <h1 className="text-3xl font-bold mb-2">Register Your Agent</h1>
        <p className="text-muted mb-8">
          Add your agent to the AgentDNS registry so others can discover and connect to it.
        </p>
        <RegisterForm />
      </main>
      <Footer />
    </div>
  );
}
