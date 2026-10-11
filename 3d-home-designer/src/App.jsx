import { useEffect, useRef, useState } from "react";
import {
  Home,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Box,
  Layers,
  MousePointer2,
  Move,
  RotateCw,
  Maximize2,
  Undo2,
  Redo2,
  Scan,
  Footprints,
  Upload,
  Sparkles,
  ArrowUp,
  X,
  Download,
  Check,
  ExternalLink,
  ImagePlus,
  Link,
  HelpCircle,
  Leaf,
  MoreHorizontal,
} from "lucide-react";
import { useEditor } from "./lib/editorStore";
import { catalog, categories } from "./lib/catalog";
import {
  requestAI,
  convertPlan,
  applyAI,
  validateBackup,
} from "./lib/integrations";
import { FurnitureRegistry } from "./lib/furniture";
import EditorScene from "./components/EditorScene";
import FloorRail from "./components/FloorRail";
import ProductIllustration from "./components/ProductIllustration";
import Inspector from "./components/Inspector";

function Dialog({ title, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-heading">
        <h2>{title}</h2>
        <button
          aria-label="Close dialog"
          className="icon-button"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function App() {
  const store = useEditor();
  const { projects, projectId, floorId, selected } = store;
  const project = projects.find((p) => p.id === projectId) || projects[0];
  const floor =
    project.floors.find((f) => f.id === floorId) || project.floors[0];
  const [category, setCategory] = useState("Furniture"),
    [query, setQuery] = useState(""),
    [tab, setTab] = useState("products");
  const [mode, setMode] = useState("translate"),
    [top, setTop] = useState(false),
    [walk, setWalk] = useState(null),
    [reset, setReset] = useState(0),
    [zoom, setZoom] = useState(1),
    [floorPoint, setFloorPoint] = useState(null);
  const [modal, setModal] = useState(null),
    [notice, setNotice] = useState(""),
    [prompt, setPrompt] = useState(""),
    [busy, setBusy] = useState(false),
    [service, setService] = useState("checking"),
    [proposal, setProposal] = useState(null);
  const [productLink, setProductLink] = useState(""),
    [importName, setImportName] = useState(""),
    [importType, setImportType] = useState("armchair"),
    [reference, setReference] = useState(null);
  const [planWidth, setPlanWidth] = useState(floor.width),
    [planDepth, setPlanDepth] = useState(floor.depth);
  const [leftOpen, setLeftOpen] = useState(() => window.innerWidth > 900),
    [rightOpen, setRightOpen] = useState(() => window.innerWidth > 650);
  const workspaceRef = useRef();
  useEffect(() => {
    fetch("/api/status")
      .then(async (r) => {
        if (
          !r.ok ||
          !(r.headers.get("content-type") || "").includes("application/json")
        )
          return setService("offline");
        const data = await r.json();
        setService(data.configured ? "configured" : "offline");
      })
      .catch(() => setService("offline"));
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") {
        setWalk(null);
        setFloorPoint(null);
      }
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? useEditor.getState().redo() : useEditor.getState().undo();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const changeFloor = (id) => {
    store.goFloor(id);
    setWalk(null);
    setFloorPoint(null);
  };
  const changeProject = (id) => {
    store.goProject(id);
    setWalk(null);
    setFloorPoint(null);
  };
  const products = catalog.filter(
    (p) =>
      p.category === category &&
      `${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase()),
  );
  const choose = (p) => {
    if (["Paint", "Surfaces"].includes(p.category)) {
      if (![...floor.rooms, ...floor.walls].some((s) => s.id === selected)) {
        setNotice("Select a wall or floor to apply this finish.");
        return;
      }
      store.material(selected, { type: p.type, color: p.color });
      setNotice(`${p.name} applied.`);
    } else {
      store.addObject(p);
      setTab("selection");
      setNotice(`${p.name} added as an editable approximation.`);
    }
  };
  const exportHome = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]/gi, "-")}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const readImage = (file, callback) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setNotice("Choose a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setNotice("Please choose an image under 1 MB for browser-local storage.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => callback({ data: reader.result, name: file.name });
    reader.onerror = () => setNotice("This image could not be read.");
    reader.readAsDataURL(file);
  };
  const openPlan = () => {
    setPlanWidth(floor.width);
    setPlanDepth(floor.depth);
    setModal("plan");
  };
  const generatePlan = async () => {
    if (!floor.plan) return;
    setBusy(true);
    try {
      const result = await requestAI("parse-floorplan", {
        image: floor.plan.data,
      });
      const geometry = convertPlan(result.sceneDsl);
      setProposal({
        floor: { ...floor, ...geometry },
        baseline: JSON.stringify(floor),
        projectId,
        floorId,
        explanation: `Detected ${geometry.rooms.length} rooms and ${geometry.walls.length} walls. Coordinates converted from feet to meters. This replaces this floor's geometry and objects. Doors, windows, staircases and cross-floor alignment need manual review.`,
      });
      setModal(null);
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  };
  const submitPrompt = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      const result = await requestAI("scene-command", {
        command: prompt,
        currentScene: { ...floor, units: "meters" },
      });
      const next = applyAI(
        result.operations,
        floor,
        Object.keys(FurnitureRegistry),
      );
      setProposal({
        floor: next,
        baseline: JSON.stringify(floor),
        projectId,
        floorId,
        explanation:
          result.explanation ||
          "Review the proposed edits before applying them.",
      });
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  };
  const attachProduct = (e) => {
    e.preventDefault();
    let url;
    try {
      if (productLink) {
        url = new URL(productLink);
        if (!["http:", "https:"].includes(url.protocol)) throw Error();
      }
    } catch {
      setNotice("Enter a valid http or https product link.");
      return;
    }
    if (!reference && !url) {
      setNotice("Add an image or product link first.");
      return;
    }
    store.addObject({
      name: importName.trim() || reference?.name || "Imported reference",
      type: importType,
      url: url?.href,
    });
    if (reference) {
      const newId = useEditor.getState().selected;
      store.updateObject(newId, { reference: reference.data });
    }
    setModal(null);
    setReference(null);
    setProductLink("");
    setImportName("");
    setTab("selection");
    setNotice(
      "Reference saved with a manually chosen approximation. No AI model was generated.",
    );
  };
  return (
    <div
      className={`app-shell ${!leftOpen ? "left-collapsed" : ""} ${!rightOpen ? "right-collapsed" : ""}`}
    >
      <aside className="left-sidebar">
        <a className="brand" href="#" aria-label="Homer home">
          <span className="brand-mark">
            <Home size={25} strokeWidth={1.6} />
          </span>
          homer<span className="brand-dot">.</span>
        </a>
        <div className="studio-label">
          <span className="status-dot" /> YOUR PERSONAL DESIGN STUDIO
        </div>
        <div className="sidebar-section-title">
          <span>Your homes</span>
          <button aria-label="Create a home" onClick={() => setModal("new")}>
            <Plus size={17} />
          </button>
        </div>
        <nav className="project-list">
          {projects.map((p) => (
            <div
              key={p.id}
              className={`project-item ${p.id === project.id ? "active" : ""}`}
            >
              <button
                className="project-button"
                onClick={() => changeProject(p.id)}
              >
                <Home size={17} />
                <span>{p.name}</span>
                {p.id === project.id ? (
                  <ChevronDown size={15} />
                ) : (
                  <ChevronRight size={15} />
                )}
              </button>
              {p.id === project.id && (
                <div className="floor-list">
                  {p.floors.map((f, i) => (
                    <button
                      key={f.id}
                      className={f.id === floor.id ? "active-floor" : ""}
                      onClick={() => changeFloor(f.id)}
                    >
                      <span className="floor-branch" />
                      <span>{f.name}</span>
                      <span className="floor-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </button>
                  ))}
                  <button
                    className="add-floor"
                    onClick={() => {
                      store.addFloor();
                      setWalk(null);
                      setFloorPoint(null);
                    }}
                  >
                    <Plus size={13} /> Add a floor
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
        <button className="new-project" onClick={() => setModal("new")}>
          <Plus size={16} /> Create a new home
        </button>
        <div className="sidebar-bottom">
          <div className="inspiration-card">
            <Leaf size={22} strokeWidth={1.3} />
            <h3>
              A little inspiration.
              <br />A place of your own.
            </h3>
            <p>Your home starts with an idea.</p>
            <button onClick={() => setModal("guide")}>
              Meet your studio <ArrowUpRight size={15} />
            </button>
          </div>
          <button className="help-link" onClick={() => setModal("guide")}>
            <HelpCircle size={16} /> Help & shortcuts <ArrowUpRight size={14} />
          </button>
          <button className="profile" onClick={() => setModal("profile")}>
            <span className="avatar">Y</span>
            <span>
              <strong>Your workspace</strong>
              <small>Personal · saved on this device</small>
            </span>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button panel-toggle"
              aria-label="Toggle homes panel"
              onClick={() => setLeftOpen(!leftOpen)}
            >
              <Layers size={17} />
            </button>
            <span>Your homes</span>
            <ChevronRight size={13} />
            <strong>{project.name}</strong>
          </div>
          <div className="topbar-actions">
            <span className="saved">
              <span className="status-dot" />{" "}
              {store.saveError ? "Save failed" : "Saved on this device"}
            </span>
            <button className="secondary export-button" onClick={exportHome}>
              <Download size={14} /> Export home
            </button>
            <button
              className="icon-button"
              aria-label="Toggle products panel"
              onClick={() => setRightOpen(!rightOpen)}
            >
              <SlidersHorizontal size={17} />
            </button>
          </div>
        </header>
        <div className="workspace-heading">
          <div>
            <div className="eyebrow">A HOME, BEAUTIFULLY YOURS</div>
            <h1>
              {project.name}
              <button
                className="icon-button"
                aria-label="Home settings"
                onClick={() => setModal("settings")}
              >
                <ChevronDown size={19} />
              </button>
            </h1>
            <p>
              {floor.name} <span>·</span> {floor.width.toFixed(1)} ×{" "}
              {floor.depth.toFixed(1)} m <span>·</span>{" "}
              {floor.plan ? "Floor plan attached" : "Example layout"}
            </p>
          </div>
          <button
            className={`secondary walk-button ${walk ? "walk-active" : ""}`}
            onClick={() => {
              setWalk(walk ? null : floorPoint || [0, 1.65, 3]);
              setTop(false);
            }}
          >
            <Footprints size={16} />
            {walk ? "Return to editor" : "Walk through"}
            <ArrowUpRight size={14} />
          </button>
        </div>
        <section
          className="workspace"
          ref={workspaceRef}
          aria-label="Interactive home editor"
        >
          <EditorScene
            key={floor.id}
            floor={floor}
            selected={selected}
            mode={mode}
            top={top}
            walk={walk}
            reset={reset}
            zoom={zoom}
            onSelect={(id) => {
              store.select(id);
              setTab("selection");
            }}
            onFloorPoint={(p) => {
              setFloorPoint(p);
              setTab("selection");
            }}
          />
          <div className="workspace-top">
            <div className="view-switch">
              <button
                className={!top ? "active" : ""}
                onClick={() => {
                  setTop(false);
                  setWalk(null);
                }}
              >
                <Box size={14} /> 3D view
              </button>
              <button
                className={top ? "active" : ""}
                onClick={() => {
                  setTop(true);
                  setWalk(null);
                }}
              >
                <Layers size={14} /> Top view
              </button>
            </div>
            <button className="floor-chip" onClick={openPlan}>
              <Layers size={13} />
              {floor.name}
              <ChevronDown size={13} />
            </button>
          </div>
          {!walk && (
            <div className="zoom-controls">
              <button
                className="icon-button"
                aria-label="Zoom in"
                disabled={zoom <= 0.5}
                onClick={() => setZoom((v) => Math.max(0.5, v * 0.8))}
              >
                <Plus size={16} />
              </button>
              <button
                className="icon-button"
                aria-label="Zoom out"
                disabled={zoom >= 2}
                onClick={() => setZoom((v) => Math.min(2, v * 1.25))}
              >
                <Minus size={16} />
              </button>
            </div>
          )}
          {!walk && (
            <div className="editor-toolbar">
              <button
                className="icon-button"
                aria-label="Select objects"
                title="Select objects"
                onClick={() => {
                  store.select(null);
                  setMode("translate");
                }}
              >
                <MousePointer2 size={18} />
              </button>
              <span className="toolbar-divider" />
              {[
                [Move, "translate", "Move"],
                [RotateCw, "rotate", "Rotate"],
                [Maximize2, "scale", "Resize"],
              ].map(([Icon, value, label]) => (
                <button
                  key={value}
                  className={`icon-button ${mode === value ? "active" : ""}`}
                  title={label}
                  aria-label={label}
                  onClick={() => {
                    setMode(value);
                    setTab("selection");
                  }}
                >
                  <Icon size={18} />
                </button>
              ))}
              <span className="toolbar-divider" />
              <button
                className="icon-button"
                title="Undo"
                aria-label="Undo"
                disabled={!store.history.length}
                onClick={store.undo}
              >
                <Undo2 size={18} />
              </button>
              <button
                className="icon-button"
                title="Redo"
                aria-label="Redo"
                disabled={!store.future.length}
                onClick={store.redo}
              >
                <Redo2 size={18} />
              </button>
              <span className="toolbar-divider" />
              <button
                className="icon-button"
                title="Reset camera"
                aria-label="Reset camera"
                onClick={() => (setZoom(1), setReset((v) => v + 1))}
              >
                <Scan size={18} />
              </button>
            </div>
          )}
          {walk ? (
            <div className="walk-hint">
              <Footprints size={15} /> Drag to look around · W A S D to explore
              <button onClick={() => setWalk(null)}>
                Back to editor <X size={13} />
              </button>
            </div>
          ) : (
            <div className="scene-hint">
              <span className="tiny-mouse" /> Drag to orbit <span>·</span>{" "}
              Scroll to change floors
            </div>
          )}
          {floorPoint && !walk && (
            <button
              className="enter-point"
              onClick={() => {
                setWalk(floorPoint);
                setTop(false);
              }}
            >
              <Footprints size={15} /> Explore from here{" "}
              <ArrowUpRight size={14} />
            </button>
          )}
          <FloorRail
            floors={project.floors}
            floorId={floor.id}
            onChange={changeFloor}
            workspaceRef={workspaceRef}
            disabled={!!walk}
          />
          <div className="scale-indicator">Units: meters</div>
        </section>
        <div className="prompt-area">
          <div className="prompt-intro">
            <Sparkles size={15} />
            <span>A little imagination goes a long way.</span>
          </div>
          <form className="prompt-box" onSubmit={submitPrompt}>
            <button
              type="button"
              className="prompt-plus"
              aria-label="Upload a floor plan"
              onClick={openPlan}
            >
              <Plus size={20} />
            </button>
            <input
              aria-label="Ask Homer to edit your home"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would make this feel more like home?"
            />
            <button
              className="submit-prompt"
              type="submit"
              disabled={busy || !prompt.trim()}
              aria-label="Submit AI request"
            >
              {busy ? <span className="spinner" /> : <ArrowUp size={20} />}
            </button>
          </form>
          <div className="prompt-footer">
            <span>
              <span
                className={`status-dot ${service === "configured" ? "" : "muted"}`}
              />
              {service === "configured"
                ? "AI service configured · requests use server billing"
                : service === "checking"
                  ? "Checking AI connection…"
                  : "AI requires a connected service"}
            </span>
            <button onClick={openPlan}>
              <Upload size={12} /> Import floor plan
            </button>
          </div>
        </div>
      </main>
      <aside className="right-sidebar">
        <header className="catalog-header">
          <div>
            <p className="eyebrow">THE FINISHING TOUCHES</p>
            <h2>Make yourself at home.</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Import product reference"
            onClick={() => setModal("import")}
          >
            <Plus size={19} />
          </button>
        </header>
        <div className="catalog-tabs">
          <button
            className={tab === "products" ? "active" : ""}
            onClick={() => setTab("products")}
          >
            Products
          </button>
          <button
            className={tab === "selection" ? "active" : ""}
            onClick={() => setTab("selection")}
          >
            Selection {selected && <span className="selection-dot" />}
          </button>
        </div>
        {tab === "selection" ? (
          <Inspector floor={floor} selected={selected} />
        ) : (
          <>
            <div className="product-search">
              <Search size={16} />
              <input
                aria-label="Search products"
                placeholder="Find something you love…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="category-grid">
              {categories.map((c) => (
                <button
                  key={c}
                  className={category === c ? "active" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="catalog-list-heading">
              <span>{query ? "Search results" : "Thoughtfully selected"}</span>
              <span>{products.length} items</span>
            </div>
            <div className="product-grid">
              {products.map((p) => (
                <article key={p.id} className="product-card">
                  <button
                    className="product-image"
                    aria-label={`Add ${p.name}`}
                    onClick={() => choose(p)}
                  >
                    <ProductIllustration type={p.type} color={p.color} />
                    <span className="add-product">
                      <Plus size={15} />
                    </span>
                  </button>
                  <p>{p.brand}</p>
                  <h3>{p.name}</h3>
                  <div className="product-meta">
                    <span>{p.url ? "Reference model" : "Studio library"}</span>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Shop ${p.name}`}
                      >
                        <ArrowUpRight size={14} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
              {!products.length && (
                <p className="no-results">
                  No matching items. Try another search, or explore the web.
                </p>
              )}
            </div>
            <div className="catalog-bottom">
              <p>Something particular in mind?</p>
              <a
                className="secondary full"
                href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query || category + " home design")}`}
                target="_blank"
                rel="noreferrer"
              >
                <Search size={14} /> Find products on the web{" "}
                <ExternalLink size={13} />
              </a>
              <button
                className="import-link"
                onClick={() => setModal("import")}
              >
                <Link size={13} /> Import an image or product link
              </button>
              <small>
                Retailer links open externally. Illustrations and 3D objects are
                approximations.
              </small>
            </div>
          </>
        )}
      </aside>
      {(notice || store.saveError) && (
        <div className="toast" role="status">
          <span>{store.saveError || notice}</span>
          <button
            disabled={!!store.saveError}
            aria-label="Dismiss notification"
            onClick={() => {
              setNotice("");
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {proposal && (
        <Dialog title="Review AI proposal" onClose={() => setProposal(null)}>
          <p className="dialog-description">{proposal.explanation}</p>
          <div className="proposal-preview">
            <EditorScene
              floor={proposal.floor}
              selected={null}
              mode="translate"
              walk={null}
              reset={0}
              zoom={1}
              top={false}
              onFloorPoint={() => {}}
              onSelect={() => {}}
            />
          </div>
          <div className="proposal-summary">
            {proposal.floor.rooms.length} rooms · {proposal.floor.walls.length}{" "}
            walls · {proposal.floor.objects.length} objects
            <br />
            For {projects.find((p) => p.id === proposal.projectId)?.name} /{" "}
            {proposal.floor.name}
          </div>
          <p className="field-note">
            Approximate geometry requires measurement checks. You can undo this
            change.
          </p>
          <div className="dialog-actions">
            <button className="secondary" onClick={() => setProposal(null)}>
              Discard
            </button>
            <button
              className="primary"
              disabled={
                projectId !== proposal.projectId ||
                floorId !== proposal.floorId ||
                JSON.stringify(floor) !== proposal.baseline
              }
              onClick={() => {
                store.editFloor(() => proposal.floor);
                setProposal(null);
                setPrompt("");
                setNotice(
                  "AI proposal applied. Review the geometry and measurements.",
                );
              }}
            >
              Apply proposal <Check size={15} />
            </button>
          </div>
          {(projectId !== proposal.projectId ||
            floorId !== proposal.floorId ||
            JSON.stringify(floor) !== proposal.baseline) && (
            <p>
              Return to the original unchanged floor to apply this proposal, or
              discard and request a fresh proposal.
            </p>
          )}
        </Dialog>
      )}
      {modal === "new" && (
        <Dialog title="A new place to call home" onClose={() => setModal(null)}>
          <p className="dialog-description">
            Start with an editable room, then bring in your floor plans.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              store.addProject(new FormData(e.currentTarget).get("name"));
              setModal(null);
              setWalk(null);
              setFloorPoint(null);
            }}
          >
            <label className="section-label" htmlFor="home-name">
              Home name
            </label>
            <input
              id="home-name"
              name="name"
              required
              maxLength={80}
              placeholder="The Sunday House"
              autoFocus
            />
            <button className="primary full" type="submit">
              Create home <Plus size={16} />
            </button>
          </form>
        </Dialog>
      )}
      {modal === "settings" && (
        <Dialog title="Home details" onClose={() => setModal(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              store.renameProject(d.get("name"));
              store.editFloor((f) => ({ ...f, name: d.get("floor") }));
              setModal(null);
            }}
          >
            <label className="section-label" htmlFor="rename-home">
              Home name
            </label>
            <input
              id="rename-home"
              name="name"
              defaultValue={project.name}
              required
              maxLength={80}
            />
            <label className="section-label" htmlFor="rename-floor">
              Floor name
            </label>
            <input
              id="rename-floor"
              name="floor"
              defaultValue={floor.name}
              required
              maxLength={80}
            />
            <button className="primary full" type="submit">
              Save details <Check size={15} />
            </button>
          </form>
          <button
            className="delete-object"
            disabled={projects.length === 1}
            onClick={() => setModal("delete")}
          >
            Delete this home
          </button>
        </Dialog>
      )}
      {modal === "delete" && (
        <Dialog title="Delete this home?" onClose={() => setModal(null)}>
          <p className="dialog-description">
            This removes “{project.name}” and its floors from this device.
            Export it first if you want a backup.
          </p>
          <div className="dialog-actions">
            <button className="secondary" onClick={exportHome}>
              Export home
            </button>
            <button
              className="primary"
              onClick={() => {
                store.deleteProject();
                setModal(null);
                setWalk(null);
                setFloorPoint(null);
              }}
            >
              Delete home
            </button>
          </div>
        </Dialog>
      )}
      {modal === "plan" && (
        <Dialog
          title={`${floor.name} · floor plan`}
          onClose={() => {
            if (!busy) setModal(null);
          }}
        >
          <p className="dialog-description">
            Attach a plan to this floor and set its overall measurements.
            Automatic tracing needs a connected AI service.
          </p>
          <label className="upload-zone">
            <ImagePlus size={27} />
            <strong>
              {floor.plan ? "Replace floor plan" : "Bring your floor plan"}
            </strong>
            <span>PNG, JPEG or WebP · up to 1 MB</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Upload floor plan"
              onChange={(e) =>
                readImage(e.target.files[0], (plan) =>
                  store.editFloor((f) => ({ ...f, plan })),
                )
              }
            />
          </label>
          {floor.plan && (
            <div className="plan-preview">
              <img src={floor.plan.data} alt={`Floor plan for ${floor.name}`} />
              <span>{floor.plan.name}</span>
            </div>
          )}
          <div className="number-grid plan-measurements">
            <label className="number-field">
              <span>Width · m</span>
              <input
                type="number"
                min="1"
                max="100"
                step=".1"
                value={planWidth}
                onChange={(e) => setPlanWidth(e.target.value)}
              />
            </label>
            <label className="number-field">
              <span>Depth · m</span>
              <input
                type="number"
                min="1"
                max="100"
                step=".1"
                value={planDepth}
                onChange={(e) => setPlanDepth(e.target.value)}
              />
            </label>
          </div>
          <p className="field-note">
            Measurements rescale the current geometry and object positions.
            Attaching an image alone does not trace it.
          </p>
          <div className="dialog-actions">
            <button
              className="secondary"
              disabled={
                busy ||
                !(
                  +planWidth >= 1 &&
                  +planWidth <= 100 &&
                  +planDepth >= 1 &&
                  +planDepth <= 100
                )
              }
              onClick={() => {
                const sx = +planWidth / floor.width,
                  sz = +planDepth / floor.depth;
                store.editFloor((f) => ({
                  ...f,
                  width: +planWidth,
                  depth: +planDepth,
                  rooms: f.rooms.map((r) => ({
                    ...r,
                    bounds: r.bounds.map((p) => [p[0] * sx, p[1] * sz]),
                  })),
                  walls: f.walls.map((w) => ({
                    ...w,
                    from: [w.from[0] * sx, w.from[1] * sz],
                    to: [w.to[0] * sx, w.to[1] * sz],
                  })),
                  objects: f.objects.map((o) => ({
                    ...o,
                    position: [
                      o.position[0] * sx,
                      o.position[1],
                      o.position[2] * sz,
                    ],
                  })),
                }));
                setNotice("Measurements applied to this floor.");
              }}
            >
              Apply measurements
            </button>
            <button
              className="primary"
              disabled={!floor.plan || busy}
              onClick={generatePlan}
            >
              <Sparkles size={15} />
              {busy ? "Analyzing…" : "Analyze with AI"}
            </button>
          </div>
          <p className="service-note">
            {service === "configured"
              ? "Configured service · check results before applying"
              : "AI conversion is unavailable until server routes and an API key are configured."}
          </p>
        </Dialog>
      )}
      {modal === "import" && (
        <Dialog title="Bring something you love" onClose={() => setModal(null)}>
          <p className="dialog-description">
            Save a product image or link and choose a simple editable shape.
            Image-to-3D generation requires an external modeling service and is
            not connected.
          </p>
          <form onSubmit={attachProduct}>
            <label className="section-label" htmlFor="reference-link">
              Product link
            </label>
            <input
              id="reference-link"
              type="url"
              placeholder="https://your-favorite-store.com/product"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
            />
            <label className="upload-zone compact">
              <Upload size={21} />
              <strong>
                {reference ? reference.name : "Or upload a product image"}
              </strong>
              <span>PNG, JPEG or WebP · up to 1 MB</span>
              <input
                type="file"
                aria-label="Upload product image"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => readImage(e.target.files[0], setReference)}
              />
            </label>
            {reference && (
              <img
                className="reference-preview"
                src={reference.data}
                alt="Imported product reference"
              />
            )}
            <label className="section-label" htmlFor="reference-name">
              Name
            </label>
            <input
              id="reference-name"
              placeholder="My favorite lounge chair"
              value={importName}
              onChange={(e) => setImportName(e.target.value)}
            />
            <label className="section-label" htmlFor="reference-type">
              Manual approximation
            </label>
            <select
              id="reference-type"
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
            >
              {[
                ...Object.keys(FurnitureRegistry),
                "plant",
                "rug",
                "art",
                "appliance",
              ].map((t) => (
                <option key={t} value={t}>
                  {t.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <button className="primary full" type="submit">
              Save reference & add shape <Plus size={15} />
            </button>
            <p className="field-note">
              Set position, scale and rotation in Selection after adding it.
            </p>
          </form>
        </Dialog>
      )}
      {modal === "guide" && (
        <Dialog
          title="Your home, from every angle"
          onClose={() => setModal(null)}
        >
          <div className="guide-grid">
            <div>
              <Move size={20} />
              <h3>Make room for you</h3>
              <p>
                Drag to orbit. Select furniture, then move, rotate or resize
                with the handles or Selection panel.
              </p>
            </div>
            <div>
              <Layers size={20} />
              <h3>One floor at a time</h3>
              <p>
                Scroll over the scene to build resistance. Cross the threshold
                to change floors, or click a floor in the sidebar.
              </p>
            </div>
            <div>
              <Footprints size={20} />
              <h3>Step inside</h3>
              <p>
                Click a floor location, then Explore from here. Drag to look in
                any direction; use W A S D to move. Escape returns to the
                editor.
              </p>
            </div>
            <div>
              <Download size={20} />
              <h3>Keep your ideas</h3>
              <p>
                Homes save in this browser. Export a JSON backup anytime. Use
                Import backup in your workspace to restore one.
              </p>
            </div>
          </div>
          <p className="service-note">
            AI edits and floor-plan tracing need configured server routes.
            Product image-to-3D and automated retailer search are not connected.
            The web search button opens Google Shopping.
          </p>
        </Dialog>
      )}
      {modal === "profile" && (
        <Dialog title="Your personal workspace" onClose={() => setModal(null)}>
          <p className="dialog-description">
            Your homes are saved on this device. No account is required. Export
            a backup before changing browsers or clearing site data.
          </p>
          <button className="secondary full" onClick={exportHome}>
            <Download size={16} /> Export current home
          </button>
          <label className="upload-zone compact">
            <Upload size={21} />
            <strong>Import a home backup</strong>
            <span>Restore a Homer JSON export</span>
            <input
              type="file"
              accept="application/json,.json"
              aria-label="Import backup"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                  if (file.size > 4 * 1024 * 1024)
                    throw Error("Backup exceeds 4 MB.");
                  const home = JSON.parse(await file.text());
                  validateBackup(home, [
                    ...Object.keys(FurnitureRegistry),
                    "plant",
                    "rug",
                    "art",
                    "appliance",
                  ]);
                  const restored = {
                    ...home,
                    id: crypto.randomUUID(),
                    floors: home.floors.map((f) => ({
                      ...f,
                      id: crypto.randomUUID(),
                    })),
                  };
                  useEditor.setState((s) => ({
                    projects: [...s.projects, restored],
                    projectId: restored.id,
                    floorId: restored.floors[0].id,
                    selected: null,
                    history: [],
                    future: [],
                  }));
                  setModal(null);
                  setNotice("Home backup restored.");
                } catch (e) {
                  setNotice(e.message);
                }
              }}
            />
          </label>
          <p className="service-note">
            User-funded AI is planned. OpenAI offers optional plan usage for
            participating Sign in with ChatGPT partners; Homer’s eligibility and
            supported capabilities still need confirmation. No billing
            connection is active.
          </p>
        </Dialog>
      )}
    </div>
  );
}
