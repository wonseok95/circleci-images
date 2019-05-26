import React from "react";

import { Container, Row, Navbar, NavbarBrand, Button, Table } from "reactstrap";

import { actions, selectors, variants } from "./data";

function App({ data }) {
  return (
    <>
      <Navbar color="dark" dark>
        <Container>
          <NavbarBrand href="#">CircleCI Image Browser</NavbarBrand>
        </Container>
      </Navbar>
      <Container>
        <Main data={data} />
      </Container>
    </>
  );
}

function Main({ data }) {
  switch (data.state) {
    case "initial":
      return <p>Preparing</p>;
    case "loading":
      return <p>Loading</p>;
    case "error":
      return <p>Error: {data.error}</p>;
    case "ok":
      return <ImageBrowser data={data} />;
    default:
      throw new Error("Unreachable");
  }
}

function ImageBrowser({ data }) {
  return (
    <>
      <Row className="p-3">
        <Pickers
          repos={data.repos}
          selectedRepo={data.repo}
          selectedVariant={data.variant}
        />
      </Row>
      <Row>
        <Tags tags={selectors.tagFilter(data)} />
      </Row>
    </>
  );
}

function Pickers({ repos, selectedRepo, selectedVariant }) {
  return (
    <div>
      <Picker
        title="Language"
        selected={selectedRepo}
        options={[{ label: "None", value: "none" }].concat(
          repos.map(({ name, repo }) => ({
            label: name,
            value: repo,
          }))
        )}
        onSelect={actions.selectRepo}
      />
      <Picker
        title="Variants"
        selected={selectedVariant}
        options={variants}
        onSelect={actions.selectVariant}
      />
    </div>
  );
}

function Picker({ title, selected, options, onClear, onSelect }) {
  return (
    <div className="mb-2">
      <h4>{title}</h4>
      {options.map(({ value, label }) => {
        return (
          <Button
            key={value}
            outline={selected !== value}
            color="info"
            size="sm"
            className="m-1"
            onClick={() => onSelect(value)}
          >
            {label}
          </Button>
        );
      })}
      {onClear && (
        <Button
          outline
          color="secondary"
          size="sm"
          className="m-1"
          onClick={onClear}
        >
          Clear
        </Button>
      )}
    </div>
  );
}

function Tags({ tags }) {
  if (!tags.length) {
    return <p>No language selected.</p>;
  }
  return (
    <Table size="sm">
      <thead>
        <tr>
          <th>Language</th>
          <th>Image</th>
        </tr>
      </thead>
      <tbody>
        {tags.map(({ language, repo, tag }) => (
          <tr key={"" + repo + tag}>
            <td>{language}</td>
            <td>
              circleci/{repo}:{tag}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default App;
