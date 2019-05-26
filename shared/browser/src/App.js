import React from "react";

import TimeAgo from "react-timeago";

import { Container, Row, Navbar, NavbarBrand, Button, Table } from "reactstrap";

import { actions, selectors } from "./data";

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
        <Picker
          title="Language"
          selected={data.repo}
          options={selectors
            .repos(data)
            .map(({ name: label, repo: value }) => ({ label, value }))}
          onSelect={actions.selectRepo}
        />
        <Picker
          title="Variants"
          selected={data.variant}
          options={selectors
            .relevantVariants(data)
            .map(({ name: label, tag: value }) => ({ label, value }))}
          onSelect={actions.selectVariant}
        />
      </Row>
      <Row>
        <Tags repo={data.repo} tags={selectors.selectedTags(data)} />
      </Row>
    </>
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

function Tags({ repo, tags }) {
  if (!tags.length) {
    return <p>No language selected.</p>;
  }
  return (
    <Table size="sm">
      <caption className="caption-top">
        Showing {tags.length} tag{tags.length !== 1 && "s"}
      </caption>
      <thead>
        <tr>
          <th>Image</th>
          <th>Size</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        {tags.map(({ language, tag, size, updated }) => (
          <tr key={"" + tag}>
            <td>
              circleci/{repo}:{tag}
            </td>
            <td>
              <Megabytes bytes={size} />
            </td>
            <td>
              <TimeAgo date={updated} title={updated.toISOString()} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function Megabytes({ bytes }) {
  return <span>{Math.round(bytes / 1024 / 1024)}MB</span>;
}

export default App;
