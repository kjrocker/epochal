# Repository Decoupling Plan: Epochal Analysis Tools

## Overview

This document outlines a plan to decouple the Metropolitan Museum data analysis tools from the main epochal repository while maintaining workspace convenience and functionality.

## Current State

The epochal repository currently contains:
- **Core Library**: Date parsing functionality in `src/lib/`
- **Analysis Tools**: Metropolitan Museum data processing in `src/metropolitian/`
- **Mixed Dependencies**: Analysis-specific packages (csv-parse, csv-stringify) in main package.json
- **Tight Coupling**: Analysis code directly imports from `../lib/`

## Proposed Architecture

### Option 1: Separate Repository with Git Submodule (Recommended)

```
epochal/ (main repository - core library)
├── src/
│   ├── lib/ (date parsing core)
│   └── index.ts (public API)
├── package.json (minimal dependencies: date-fns)
├── tsconfig.json
├── examples/ (git submodule)
│   └── metropolitan-museum/ → epochal-analysis repo
│       ├── package.json (analysis dependencies)
│       ├── tsconfig.json (extends/references main)
│       ├── src/
│       │   ├── analysis/
│       │   │   ├── interactive-blocklist-manager.ts
│       │   │   ├── main.ts
│       │   │   └── processors/
│       │   ├── config/
│       │   │   └── config-manager.ts
│       │   ├── io/
│       │   │   ├── csv-processor.ts
│       │   │   └── result-writer.ts
│       │   └── utils/
│       ├── data/ (museum datasets & blocklists)
│       ├── results/ (analysis outputs)
│       └── README.md (analysis-specific docs)

epochal-analysis/ (separate repository)
├── src/ (same structure as submodule)
├── package.json
├── tsconfig.json
├── data/
├── results/
└── README.md
```

### Option 2: Monorepo with Workspace Structure

```
epochal/ (monorepo root)
├── packages/
│   ├── core/ (main epochal library)
│   │   ├── src/lib/
│   │   ├── package.json ("name": "@epochal/core")
│   │   └── tsconfig.json
│   └── analysis/ (museum analysis tools)
│       ├── src/
│       ├── data/
│       ├── results/
│       ├── package.json ("name": "@epochal/analysis")
│       └── tsconfig.json (references core)
├── package.json (workspace configuration)
├── tsconfig.json (shared base config)
└── lerna.json or pnpm-workspace.yaml
```

## Implementation Plan

### Phase 1: Create Separate Analysis Repository

1. **Create New Repository**
   ```bash
   # Create new repo: epochal-analysis
   mkdir ../epochal-analysis
   cd ../epochal-analysis
   git init
   ```

2. **Move Analysis Code**
   - Copy `src/metropolitian/` → `epochal-analysis/src/`
   - Restructure directories for cleaner separation:
     ```
     src/
     ├── analysis/ (main processing logic)
     ├── config/ (configuration management)
     ├── io/ (CSV processing utilities)
     └── processors/ (data processors)
     ```

3. **Set Up Independent Package Configuration**
   ```json
   {
     "name": "epochal-analysis",
     "version": "1.0.0",
     "description": "Metropolitan Museum data analysis tools for epochal",
     "scripts": {
       "build": "tsc",
       "test": "jest",
       "lint": "eslint src",
       "process": "npx ts-node src/analysis/main.ts",
       "interactive": "npx ts-node src/analysis/interactive-blocklist-manager.ts"
     },
     "dependencies": {
       "epochal": "file:../epochal",
       "csv-parse": "^6.1.0",
       "csv-stringify": "^6.6.0"
     },
     "devDependencies": {
       "@types/node": "^24.3.0",
       "typescript": "^5.2.2",
       "jest": "^29.7.0",
       "eslint": "^9.12.0"
     }
   }
   ```

4. **Configure TypeScript**
   ```json
   {
     "extends": "../epochal/tsconfig.json",
     "compilerOptions": {
       "outDir": "./build",
       "rootDir": "./src"
     },
     "include": ["src/**/*"],
     "references": [
       { "path": "../epochal" }
     ]
   }
   ```

### Phase 2: Integrate as Git Submodule

1. **Add Submodule to Main Repository**
   ```bash
   cd epochal
   git submodule add https://github.com/username/epochal-analysis.git examples/metropolitan-museum
   git commit -m "Add analysis tools as submodule"
   ```

2. **Update Main Package.json**
   ```json
   {
     "scripts": {
       "build": "tsc",
       "test": "jest",
       "lint": "eslint src",
       "analysis:process": "cd examples/metropolitan-museum && npm run process",
       "analysis:interactive": "cd examples/metropolitan-museum && npm run interactive",
       "analysis:install": "cd examples/metropolitan-museum && npm install"
     }
   }
   ```

3. **Create Workspace Scripts**
   ```bash
   # scripts/setup-analysis.sh
   #!/bin/bash
   git submodule update --init --recursive
   cd examples/metropolitan-museum
   npm install
   npm link ../../
   ```

### Phase 3: Refactor Dependencies and Imports

1. **Update Import Statements**
   ```typescript
   // Before (in analysis code)
   import { epochize } from '../lib/index';
   import { Maybe } from '../lib/util/maybe';
   
   // After
   import { epochize } from 'epochal';
   import { Maybe } from 'epochal/lib/util/maybe';
   ```

2. **Configure Module Resolution**
   - Use `npm link` for development
   - Published version for production use
   - Relative path import as fallback

3. **Update Analysis Code Structure**
   ```typescript
   // src/analysis/base-processor.ts
   import { epochize } from 'epochal';
   
   export abstract class BaseProcessor {
     protected epochize = epochize;
     // Common analysis functionality
   }
   
   // src/analysis/museum-processor.ts
   export class MuseumProcessor extends BaseProcessor {
     // Metropolitan-specific logic
   }
   ```

### Phase 4: Documentation and Workflow Updates

1. **Update Main README**
   - Move analysis-specific documentation to submodule
   - Add section on working with analysis tools
   - Include submodule setup instructions

2. **Create Analysis README**
   - Comprehensive analysis tool documentation
   - Data source information
   - Configuration options
   - Usage examples

3. **CI/CD Considerations**
   ```yaml
   # .github/workflows/test-with-analysis.yml
   - name: Setup submodules
     run: |
       git submodule update --init --recursive
       cd examples/metropolitan-museum
       npm install
       npm link ../../
   
   - name: Test analysis tools
     run: npm run analysis:test
   ```

## Benefits of This Approach

### Separation of Concerns
- **Core Library**: Focused solely on date parsing functionality
- **Analysis Tools**: Isolated museum-specific processing logic
- **Clear Boundaries**: Explicit interfaces between components
- **Independent Evolution**: Each component can evolve at its own pace

### Maintainability
- **Reduced Complexity**: Smaller, focused codebases
- **Easier Onboarding**: Contributors can focus on specific areas
- **Clear Ownership**: Distinct responsibility areas
- **Better Testing**: Isolated test suites

### Distribution Flexibility
- **Core Package**: Lightweight, focused npm package
- **Optional Analysis**: Users choose what they need
- **Separate Versioning**: Independent release cycles
- **Specialized Documentation**: Targeted for each audience

### Development Convenience
- **Unified Workspace**: Everything accessible in one location
- **Shared Tools**: Common development environment
- **Cross-Project Development**: Easy to work on both simultaneously
- **Consistent Configuration**: Shared ESLint, TypeScript configs

## Migration Checklist

### Pre-Migration
- [ ] Backup current repository state
- [ ] Document current analysis workflows
- [ ] Identify all cross-dependencies
- [ ] Plan backward compatibility approach

### Repository Creation
- [ ] Create epochal-analysis repository
- [ ] Set up basic project structure
- [ ] Configure package.json and dependencies
- [ ] Set up TypeScript configuration

### Code Migration
- [ ] Move analysis code to new repository
- [ ] Update import statements
- [ ] Restructure directories for clarity
- [ ] Update file references and paths

### Integration
- [ ] Add as git submodule
- [ ] Update main repository scripts
- [ ] Create setup automation
- [ ] Test cross-repository functionality

### Documentation
- [ ] Update main repository README
- [ ] Create analysis repository documentation
- [ ] Document new development workflow
- [ ] Update contributing guidelines

### Testing & Validation
- [ ] Verify all analysis functionality works
- [ ] Test submodule workflow
- [ ] Validate CI/CD pipeline
- [ ] Confirm publishing process

## Future Considerations

### Additional Analysis Modules
With this architecture, additional analysis modules can be easily added:
- Other museum datasets (Smithsonian, British Museum)
- Historical document analysis
- Archaeological dating validation
- Performance benchmarking tools

### Publishing Strategy
- Core library: Published to npm as `epochal`
- Analysis tools: Published as `@epochal/analysis` or separate package
- Docker containers for reproducible analysis environments

### Community Contributions
- Lower barrier to entry for core library contributions
- Specialized expertise areas for analysis contributions
- Clear separation of security/stability concerns

## Conclusion

This decoupling approach provides the best balance of:
- **Maintainability**: Clear separation and focused codebases
- **Usability**: Convenient development experience
- **Flexibility**: Independent evolution and distribution
- **Growth**: Foundation for additional analysis tools

The git submodule approach is recommended as it provides the cleanest separation while maintaining workspace convenience for development.