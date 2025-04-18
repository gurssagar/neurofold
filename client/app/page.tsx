"use client";
"use client"
import Image from "next/image";
import { signIn } from "next-auth/react"
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useState, useRef ,useEffect} from "react";
import { Search, Dna, Database, ArrowRight, FlaskConical, Loader2, Microscope, Atom, Beaker, ScrollText, Scale, Droplets, Gauge, Pill, Binary } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const { data: session } = useSession();
  console.log(session)
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");
  const [protein, setProtein] = useState<ProteinDetails>();
  const [drugDiscoveryResult, setDrugDiscoveryResult] = useState<DrugDiscoveryResult | undefined>();
  const [proteinDrugDiscoveryResult, setProteinDrugDiscoveryResult] = useState<ProteinDrugDiscoveryResult | undefined>();
  const [loading, setLoading] = useState(false);
  const [initiatingDiscovery, setInitiatingDiscovery] = useState(false);
  const [searchMode, setSearchMode] = useState<'protein' | 'drug'>('protein');
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

  const User = async () => {
    try {
      if (!session?.user) {
        console.log("No user session available");
        return;
      }
      
      const response = await fetch('/api/User', {
        method: 'POST',
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          username: (session.user as any)?.username || "user" + Math.floor(Math.random() * 10000)
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log("User data saved:", data);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  }
  const fetchData = async () => {
    if (!query) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://rest.uniprot.org/uniprotkb/search?query=${query}`);
      const data = await response.json();
      console.log(data)
      if (data.results && data.results.length > 0) {
        setProtein(data.results[0]);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching protein data:", error);
    }
    setLoading(false);
  };
  const [userData, setUserData] = useState<any[]>([]);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/User", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Users data:", data.users);
        setUserData(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    
    fetchUser();
  }, []);

  const handleGithubLogin = async () => {
    try {
      await signIn("github");
      // User data will be saved after successful login via useEffect
    } catch (error) {
      console.error("Error during GitHub login:", error);
    }
  };
  

  const currentUser = userData.find(user => user.username === (session?.user as any)?.username);

  // Effect to save user data when session becomes available
  useEffect(() => {
    if (session?.user) {
      User();
    }
  }, [session]);

  const handleDrugDiscovery = async () => {
    setInitiatingDiscovery(true);
    try {
      const currentUser = userData.find(user => user.username === (session?.user as any)?.username);
      if (!currentUser || currentUser.coins <= 0) {
        alert("You don't have enough credits to perform this action.");
        setInitiatingDiscovery(false);
        return;
      }
      


      console.log(protein?.primaryAccession)
      console.log(query)
      await fetch(`/api/User`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: (session?.user as any)?.username,
          coins: (currentUser.coins - 1)
        })
      }).then((res) => {console.log(res)});
      
      const response = await fetch(`https://${apiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uniprot_id: protein?.primaryAccession,
          drug_name: query
        })
      });
      const data = await response.json();
      setDrugDiscoveryResult(data);
    } catch (error) {
      console.error("Error in drug discovery:", error);
    }
    setInitiatingDiscovery(false);
  };

  const handleProteinDrugDiscovery = async () => {

    const currentUser = userData.find(user => user.username === (session?.user as any)?.username);
      if (!currentUser || currentUser.coins <= 0) {
        alert("You don't have enough credits to perform this action.");
        setInitiatingDiscovery(false);
        return;
      }
      await fetch(`/api/User`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: (session?.user as any)?.username,
          coins: (currentUser.coins - 1)
        })
      }).then((res) => {console.log(res)});


    setInitiatingDiscovery(true);
    try {
      console.log(protein?.primaryAccession)
      console.log(query)
      const response = await fetch(`https://${apiUrl}/discover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uniprot_id: protein?.primaryAccession,
          drug_name: query,
          top_n: 5
        })
      });
      const data = await response.json();
      console.log(data)
      setProteinDrugDiscoveryResult(data);
    } catch (error) {
      console.error("Error in drug discovery:", error);
    }
    setInitiatingDiscovery(false);
  };
  console.log(userData,"test")
  const renderResults = () => {
    console.log(searchMode)
    if (searchMode == 'protein' && !proteinDrugDiscoveryResult) return null;
    if(searchMode == 'drug' && !drugDiscoveryResult) return null

    if (searchMode === 'protein') {
      return (
        
        <>        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {proteinDrugDiscoveryResult?.top_candidates.map((candidate, index) => (
              <div key={index} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Candidate: {candidate.name}</h3>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Binary className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Drug-likeness Score</span>
                    </div>
                    <div className="relative h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${candidate.score * 100}%` }} />
                    </div>
                    <p className="mt-2 text-right text-sm font-medium">
                      {(candidate.score * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Molecular Structure</h3>
                  <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                    <img
                      src={`data:image/png;base64,${candidate.image_base64}`}
                      alt={`Structure of ${candidate.name}`}
                      className="max-w-full h-auto" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">SMILES Notation</h3>
                  <div className="space-y-2">
                    <p
                      className="text-sm bg-muted/50 p-3 rounded-lg font-mono break-all"
                    >
                      {proteinDrugDiscoveryResult.top_candidates[index].smiles}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2 mt-8">Insights</h3>
            <div className="space-y-2">
              <ReactMarkdown>
                {proteinDrugDiscoveryResult?.insights}
              </ReactMarkdown>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
        
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FlaskConical className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Drug Discovery Results</h2>
              <p className="text-muted-foreground">Potential drug candidate for {protein?.proteinDescription?.recommendedName?.fullName?.value}</p>
            </div>
          </div><div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Drug Properties</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Molecular Weight</span>
                      </div>
                      <p className="text-2xl font-bold">{drugDiscoveryResult?.molecular_weight}</p>
                      <p className="text-xs text-muted-foreground">Daltons</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">LogP</span>
                      </div>
                      <p className="text-2xl font-bold">{drugDiscoveryResult?.logP}</p>
                      <p className="text-xs text-muted-foreground">Partition coefficient</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Binding Analysis</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Gauge className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Binding Probability</span>
                    </div>
                    <div className="relative h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${(drugDiscoveryResult?.binding_probability ?? 0) * 100}%` }} />
                    </div>
                    <p className="mt-2 text-right text-sm font-medium">
                      {((drugDiscoveryResult?.binding_probability ?? 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Hydrogen Bonding</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">H-Bond Donors</p>
                      <p className="text-2xl font-bold">{drugDiscoveryResult?.h_bond_donors}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">H-Bond Acceptors</p>
                      <p className="text-2xl font-bold">{drugDiscoveryResult?.h_bond_acceptors}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Molecular Structure</h3>
                <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                  <img
                    src={drugDiscoveryResult?.molecule_image}
                    alt="Molecular structure"
                    className="max-w-full h-auto" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">SMILES Notation</h3>
                <p className="text-sm bg-muted/50 p-3 rounded-lg font-mono break-all">
                  {drugDiscoveryResult?.smiles}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Heatmap</h3>
              <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                <img
                  src={drugDiscoveryResult?.heatmap_image}
                  alt="heatmap"
                  className="max-w-full h-auto" />
              </div>
            </div>
            <div>
              {drugDiscoveryResult?.top_similar_drugs.map((drug, i) => (
                <div key={i} className="border p-4 rounded shadow-md m-2">
                  <h3 className="font-semibold text-lg">{drug.name}</h3>
                  <p>Similarity: {drug.similarity}</p>
                  <img
                    src={drug.image_base64}
                    alt={`Structure of ${drug.name}`}
                    className="w-32 h-32 mt-2" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2 mt-8">Insights</h3>
            <div className="space-y-2">
              <ReactMarkdown>
                {drugDiscoveryResult?.insights}
              </ReactMarkdown>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <>
    {showModal?
    <>
    <div className="z-50 fixed top-[10%] rounded-xl left-[calc(50%_-_30em)] w-[60em] bg-black ">
      <div className="rounded-3xl h-[30em] bg-[#0F0F11] text-white py-20 px-4 relative">
        {/* Close button added to top-left */}
        <button 
          className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-colors"
          onClick={() => {setShowModal(false)}}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <h2 className="text-4xl font-bold text-center mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-center text-gray-400 mb-10">
          Unlock all features including unlimited posts for your blog.
        </p>

        <div className="z-50 max-w-4xl mx-auto grid grid-cols-1 gap-8">
          {/* Pricing Card */}
          <div
            className="bg-[#131316] p-8 rounded-xl border border-gray-800 shadow-lg flex justify-between"
          >
            <div>
              <h3 className="text-2xl font-semibold mb-6">
                What's included in the PRO plan
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li>✓ 200 Coins</li>
                <li>✓ Customized Support</li>
                <li>✓ Access to Beta Versions</li>
              </ul>
            </div>

            <div className="mt-10 text-center">
              <div className="text-5xl font-bold mb-2">$19</div>
              <div className="text-gray-400 mb-6">Billed Monthly</div>
              <a href="https://rzp.io/rzp/2fuBHKS">
                  <button className="bg-white text-black font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 transition">
                      Get Started
                  </button>
              </a>
              
            </div>
          </div>
        </div>
      </div>
    </div>
    </>:
    <>
    </>

    }
    
    <div className="mx-auto p-5 mt-10 w-[80%] bg-black rounded-full">
          <div className="flex justify-between">
              <div  className="flex">
                <div>
                <div className="flex justify-center ">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                <Dna className="h-8 w-8 text-primary text-white " />
                </motion.div>
              </div>
                </div>
              <h1 className="text-xl font-bold  text-white">
                  NEUROFOLD
              </h1>
              </div>
              <div className="flex gap-4">
                {userData.length > 0 && userData.some(user => user.username === (session?.user as any)?.username) ? (
                  <div className="text-white my-auto">
                    Credits Left: {userData.find(user => user.username === (session?.user as any)?.username)?.coins || 0}
                  </div>
                ) : (
                  <></>
                )}
                <div>
                  {session?.user?.image ? (
                    <>
                      <Image src={(session?.user as any)?.image} className="rounded-full" alt="hello" width={36} height={36} />
                    </>
                  ) : (
                    <></>
                  )}
                </div>
                {session ? (
                  <>
                    <button className={`bg-white text-black rounded px-4 hover:scale-1.25 py-1 rounded-full`} onClick={() => {signOut()}}>Log Out</button>
                  </>
                ) : (
                  <>
                    <button className={`bg-white text-black rounded px-4 hover:scale-1.25 py-1 rounded-full`} onClick={handleGithubLogin}>Github Login</button>
                  </>
                )}
              </div>
          </div>
      </div>
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Dna className="h-20 w-20 text-primary" />
            </motion.div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            NEUROFOLD
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock the potential of protein-based drug discovery with our advanced search platform.
            Enter a protein name or UniProt ID to explore detailed molecular information and structural insights.
          </p>
        </motion.div>
        {session?.user?
        <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-xl mx-auto mb-8"
        >
          <Tabs defaultValue="protein" className="w-full" onValueChange={(value) => setSearchMode(value as 'protein' | 'drug')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="protein" className="flex items-center gap-2">
                <Dna className="h-4 w-4" />
                Protein-based
              </TabsTrigger>
              <TabsTrigger value="drug" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Drug-based
              </TabsTrigger>
            </TabsList>
            <TabsContent value="protein" className="mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter protein name or UniProt ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-lg"
                />
                {currentUser?.coins==0?<>
                  <Button onClick={() => setShowModal(true)} disabled={loading}>
                  {loading ? (
                    "Searching..."
                  ) : (
                    <>
                      Search <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                </>:<>
                <Button onClick={() => fetchData()} disabled={loading}>
                  {loading ? (
                    "Searching..."
                  ) : (
                    <>
                      Search <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                </>}
                
              </div>
            </TabsContent>
            <TabsContent value="drug" className="mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter drug name or ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-lg"
                />
                {currentUser?.coins==0?<>
                  <Button onClick={() => setShowModal(true)} disabled={loading}>
                  {loading ? (
                    "Searching..."
                  ) : (
                    <>
                      Search <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                </>:<>
                <Button onClick={() => fetchData()} disabled={loading}>
                  {loading ? (
                    "Searching..."
                  ) : (
                    <>
                      Search <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                </>}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
        </>:
        <>
        <div onClick={() => {handleGithubLogin()}} className="hover:scale-1.05 text-center mx-auto w-40 text-white bg-black px-4 rounded-xl py-2">
              Sign Up Now
        </div>
        </>}
        

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mt-16"
        >
          {[
            {
              icon: <Database className="h-8 w-8" />,
              title: "Comprehensive Database",
              description: "Access detailed information from UniProt database"
            },
            {
              icon: <Dna className="h-8 w-8" />,
              title: "Structural Analysis",
              description: "Explore protein structures and molecular properties"
            },
            {
              icon: <Search className="h-8 w-8" />,
              title: "Smart Search",
              description: "Find proteins by name, ID, or sequence similarity"
            }
          ].map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4 text-primary">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </motion.div>

        {protein && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-16"
          >
            <Card className="p-8 bg-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Microscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{protein.proteinDescription?.recommendedName?.fullName?.value}</h2>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      UniProt ID: {protein.primaryAccession}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Length: {protein.sequence?.length} aa
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Atom className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Molecular Properties</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Mass:</span> {" "}
                      {protein.sequence?.molWeight ? `${(protein.sequence.molWeight / 1000).toFixed(2)} kDa` : "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Organism:</span> {" "}
                      {protein.organism?.scientificName || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Function</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {protein.comments?.find(c => c.commentType === "FUNCTION")?.texts?.[0]?.value || 
                     protein.comments?.[0]?.texts?.[0]?.value || 
                     "Functional information not available"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Gene Information</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Gene:</span> {" "}
                      {protein.genes?.[0]?.geneName?.value || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Alternative names:</span> {" "}
                      {protein.proteinDescription?.alternativeNames?.map(name => name.fullName.value).join(", ") || "None"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <Button
                  size="lg"
                  onClick={() =>
                    searchMode === 'protein' ? handleProteinDrugDiscovery() : handleDrugDiscovery()
                  }
                  disabled={initiatingDiscovery}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
                >
                  {initiatingDiscovery ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initiating Discovery...
                    </>
                  ) : (
                    <>
                      <FlaskConical className="mr-2 h-5 w-5" />
                      Initiate Drug Discovery
                    </>
                  )}
                </Button>
              </motion.div>
            </Card>

            {(drugDiscoveryResult || proteinDrugDiscoveryResult) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mt-8"
              >
                <Card className="p-8 bg-card border-2 border-primary/20">
                  {renderResults()}
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </main>
    </>
  );}
