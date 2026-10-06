import { useEffect, useState } from "react";
import {
  Button,
  MantineProvider,
  Modal,
  TextInput,
  Text,
  Stack,
} from "@mantine/core";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { theme } from "../styles/theme";

type SearchDocument = {
  title: string;
  group: string;
  href: string;
  text: string;
};
function Search() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  const [opened, setOpened] = useState(false);
  const [term, setTerm] = useState("");
  const { data, isPending, isError, refetch } = useQuery<SearchDocument[]>({
    queryKey: ["public-docs-index"],
    enabled: opened,
    staleTime: Infinity,
    retry: 1,
    queryFn: async ({ signal }) => {
      const response = await fetch("/crmail/search.json", { signal });
      if (!response.ok) throw new Error("Arama dizini yüklenemedi");
      return response.json();
    },
  });
  const normalized = term.trim().toLocaleLowerCase("tr");
  const results = (data ?? [])
    .filter(
      (d) =>
        !normalized ||
        `${d.title} ${d.text}`.toLocaleLowerCase("tr").includes(normalized),
    )
    .slice(0, 12);
  return (
    <>
      <Button
        variant="subtle"
        className="search-trigger"
        disabled={!ready}
        aria-busy={!ready}
        onClick={() => setOpened(true)}
      >
        Belgelerde ara
      </Button>
      <Modal
        closeButtonProps={{ "aria-label": "Aramayı kapat" }}
        opened={opened}
        onClose={() => setOpened(false)}
        title="Araştırmada ara"
        size="lg"
        centered
        classNames={{ content: "search-modal", title: "search-title" }}
      >
        <TextInput
          label="Kelime veya konu"
          placeholder="Örn. teklif, DocType, MJML"
          value={term}
          onChange={(event) => setTerm(event.currentTarget.value)}
          data-autofocus
          autoComplete="off"
        />
        <Stack gap="xs" mt="lg" aria-live="polite">
          {isPending && <Text>Arama dizini yükleniyor…</Text>}
          {isError && (
            <>
              <Text>
                Dizin yüklenemedi. Sayfadaki belge bağlantılarını kullanabilir
                veya yeniden deneyebilirsiniz.
              </Text>
              <Button onClick={() => refetch()}>Yeniden dene</Button>
            </>
          )}
          {!isPending && !isError && results.length === 0 && (
            <Text>Sonuç bulunamadı. Daha kısa bir kelime deneyin.</Text>
          )}
          {results.map((result) => (
            <a key={result.href} className="search-result" href={result.href}>
              <span>{result.group}</span>
              <strong>{result.title}</strong>
            </a>
          ))}
        </Stack>
      </Modal>
    </>
  );
}
export default function Controls() {
  const [client] = useState(() => new QueryClient());
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <QueryClientProvider client={client}>
        <Search />
      </QueryClientProvider>
    </MantineProvider>
  );
}
